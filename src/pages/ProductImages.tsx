import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEOHead';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { Package, Layers, Settings, ClipboardCheck, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { toast } from '@/lib/brandedToast';
import { ALL_SCENES } from '@/components/app/product-images/sceneData';
import { ProductImagesStep1Products } from '@/components/app/product-images/ProductImagesStep1Products';
import { ProductImagesStep2Scenes } from '@/components/app/product-images/ProductImagesStep2Scenes';
import { ProductImagesStep3Details } from '@/components/app/product-images/ProductImagesStep3Details';
import { ProductImagesStep4Review } from '@/components/app/product-images/ProductImagesStep4Review';
import { ProductImagesStep5Generating } from '@/components/app/product-images/ProductImagesStep5Generating';
import { ProductImagesStep6Results } from '@/components/app/product-images/ProductImagesStep6Results';
import type { PIStep, UserProduct, DetailSettings } from '@/components/app/product-images/types';

const CREDITS_PER_IMAGE = 6;

const STEP_DEFS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Scenes', icon: Layers },
  { number: 3, label: 'Details', icon: Settings },
  { number: 4, label: 'Review', icon: ClipboardCheck },
  { number: 5, label: 'Generate', icon: Sparkles },
  { number: 6, label: 'Results', icon: CheckCircle },
];

export default function ProductImages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, openBuyModal, setBalanceFromServer, refreshBalance } = useCredits();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<PIStep>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<DetailSettings>({});

  // Generation state
  const [jobMap, setJobMap] = useState<Map<string, string>>(new Map());
  const [completedJobs, setCompletedJobs] = useState(0);
  const [results, setResults] = useState<Map<string, { images: string[]; productName: string }>>(new Map());
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load user products
  const { data: userProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProduct[];
    },
    enabled: !!user?.id,
  });

  const selectedProducts = useMemo(
    () => userProducts.filter(p => selectedProductIds.has(p.id)),
    [userProducts, selectedProductIds],
  );

  const selectedScenes = useMemo(
    () => ALL_SCENES.filter(s => selectedSceneIds.has(s.id)),
    [selectedSceneIds],
  );

  const totalImages = selectedProducts.length * selectedScenes.length;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;

  // Build instruction from scene + details
  const buildInstruction = useCallback((scene: typeof ALL_SCENES[0]) => {
    const parts: string[] = [scene.description];
    if (details.backgroundTone) parts.push(`Background: ${details.backgroundTone}`);
    if (details.mood) parts.push(`Mood: ${details.mood}`);
    if (details.lightingStyle) parts.push(`Lighting: ${details.lightingStyle}`);
    if (details.environmentType) parts.push(`Environment: ${details.environmentType}`);
    if (details.surfaceType) parts.push(`Surface: ${details.surfaceType}`);
    if (details.presentation) parts.push(`Person: ${details.presentation}`);
    if (details.actionType) parts.push(`Action: ${details.actionType}`);
    if (details.focusArea) parts.push(`Focus: ${details.focusArea}`);
    if (details.brandingVisibility) parts.push(`Branding: ${details.brandingVisibility}`);
    if (details.layoutSpace) parts.push(`Layout: ${details.layoutSpace}`);
    if (details.customNote) parts.push(`Note: ${details.customNote}`);
    return parts.join('. ');
  }, [details]);

  // Generation handler
  const handleGenerate = useCallback(async () => {
    if (balance < totalCredits) { openBuyModal(); return; }

    setStep(5);
    setCompletedJobs(0);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(4); return; }

    const batchId = crypto.randomUUID();
    const newJobMap = new Map<string, string>();
    let lastBalance: number | null = null;

    for (const product of selectedProducts) {
      const base64Image = await convertImageToBase64(product.image_url);

      for (const scene of selectedScenes) {
        const payload: Record<string, unknown> = {
          workflow_name: 'Product Images',
          workflow_slug: 'product-images',
          product: {
            title: product.title,
            productType: product.product_type,
            description: product.description,
            dimensions: product.dimensions || undefined,
            imageUrl: base64Image,
          },
          product_name: product.title,
          product_image_url: product.image_url,
          selected_variations: [{
            label: scene.title,
            instruction: buildInstruction(scene),
          }],
          quality: 'high',
          aspectRatio: scene.id === 'wide-banner' ? '16:9' : '1:1',
          batch_id: batchId,
        };

        await paceDelay(newJobMap.size);

        const result = await enqueueWithRetry(
          { jobType: 'workflow', payload, imageCount: 1, quality: 'high', hasModel: false, hasScene: false, skipWake: true },
          token,
        );

        if (!isEnqueueError(result)) {
          const key = `${product.id}_${scene.id}`;
          newJobMap.set(key, result.jobId);
          lastBalance = result.newBalance;
          injectActiveJob(queryClient, {
            jobId: result.jobId,
            workflow_name: 'Product Images',
            workflow_slug: 'product-images',
            product_name: product.title,
            job_type: 'workflow',
            quality: 'high',
            imageCount: 1,
            batch_id: batchId,
          });
        } else if (result.type === 'insufficient_credits') {
          toast.error(result.message);
          break;
        }
      }
    }

    if (newJobMap.size === 0) {
      toast.error('Could not queue any jobs');
      setStep(4);
      return;
    }

    if (lastBalance !== null) setBalanceFromServer(lastBalance);
    setJobMap(newJobMap);
    sendWake(token);

    // Start polling
    startPolling(newJobMap);
  }, [selectedProducts, selectedScenes, balance, totalCredits, buildInstruction, openBuyModal, setBalanceFromServer, queryClient]);

  const startPolling = useCallback((activeJobMap: Map<string, string>) => {
    const jobIds = Array.from(activeJobMap.values());
    const productMap = new Map<string, string>(); // jobId -> productId
    for (const [key, jobId] of activeJobMap.entries()) {
      const productId = key.split('_')[0];
      productMap.set(jobId, productId);
    }

    const poll = async () => {
      try {
        const { data: jobs } = await supabase
          .from('generation_queue')
          .select('id, status, result')
          .in('id', jobIds);

        if (!jobs) { pollingRef.current = setTimeout(poll, 3000); return; }

        const done = jobs.filter(j => j.status === 'completed' || j.status === 'failed');
        setCompletedJobs(done.length);

        if (done.length >= jobIds.length) {
          // Collect results
          const resultMap = new Map<string, { images: string[]; productName: string }>();
          for (const job of jobs) {
            if (job.status !== 'completed' || !job.result) continue;
            const productId = productMap.get(job.id) || 'unknown';
            const product = selectedProducts.find(p => p.id === productId);
            const r = job.result as any;
            const images: string[] = [];
            if (Array.isArray(r.images)) {
              for (const img of r.images) {
                const url = typeof img === 'string' ? img : img?.url || img?.image_url;
                if (url) images.push(url);
              }
            }
            if (images.length > 0) {
              const existing = resultMap.get(productId) || { images: [], productName: product?.title || 'Product' };
              existing.images.push(...images);
              resultMap.set(productId, existing);
            }
          }

          setResults(resultMap);
          refreshBalance();
          setStep(6);
          return;
        }

        pollingRef.current = setTimeout(poll, 3000);
      } catch {
        pollingRef.current = setTimeout(poll, 5000);
      }
    };

    pollingRef.current = setTimeout(poll, 2000);
  }, [selectedProducts, refreshBalance]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollingRef.current) clearTimeout(pollingRef.current); };
  }, []);

  const canNavigateTo = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return selectedProductIds.size > 0;
    if (s === 3) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    if (s === 4) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    return false; // 5, 6 not clickable
  };

  return (
    <div className="space-y-6">
      <SEOHead title="Product Images — VOVV" description="Generate product images" />
      <PageHeader title="Product Images" subtitle="Generate stunning product visuals across multiple scene types."><span /></PageHeader>

      {step <= 4 && (
        <CatalogStepper
          steps={STEP_DEFS}
          currentStep={step}
          canNavigateTo={canNavigateTo}
          onStepClick={(s) => setStep(s as PIStep)}
        />
      )}

      <div className="mt-6">
        {step === 1 && (
          <ProductImagesStep1Products
            products={userProducts}
            isLoading={isLoadingProducts}
            selectedIds={selectedProductIds}
            onSelectionChange={setSelectedProductIds}
            onContinue={() => setStep(2)}
            onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
          />
        )}

        {step === 2 && (
          <ProductImagesStep2Scenes
            selectedSceneIds={selectedSceneIds}
            onSelectionChange={setSelectedSceneIds}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ProductImagesStep3Details
            selectedSceneIds={selectedSceneIds}
            productCount={selectedProducts.length}
            details={details}
            onDetailsChange={setDetails}
            onContinue={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <ProductImagesStep4Review
            selectedProducts={selectedProducts}
            selectedSceneIds={selectedSceneIds}
            details={details}
            creditsPerImage={CREDITS_PER_IMAGE}
            balance={balance}
            onGenerate={handleGenerate}
            onBack={() => setStep(3)}
            onOpenBuyCredits={openBuyModal}
          />
        )}

        {step === 5 && (
          <ProductImagesStep5Generating
            totalJobs={jobMap.size}
            completedJobs={completedJobs}
            productCount={selectedProducts.length}
          />
        )}

        {step === 6 && (
          <ProductImagesStep6Results
            results={results}
            onGenerateMore={() => { setStep(2); setResults(new Map()); setJobMap(new Map()); }}
            onGoToLibrary={() => navigate('/app/library')}
          />
        )}
      </div>
    </div>
  );
}
