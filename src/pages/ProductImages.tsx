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
import { getTriggeredBlocks } from '@/components/app/product-images/detailBlockConfig';
import { ProductImagesStep1Products } from '@/components/app/product-images/ProductImagesStep1Products';
import { ProductImagesStep2Scenes } from '@/components/app/product-images/ProductImagesStep2Scenes';
import { ProductImagesStep3Details } from '@/components/app/product-images/ProductImagesStep3Details';
import { ProductImagesStep4Review } from '@/components/app/product-images/ProductImagesStep4Review';
import { ProductImagesStep5Generating } from '@/components/app/product-images/ProductImagesStep5Generating';
import { ProductImagesStep6Results } from '@/components/app/product-images/ProductImagesStep6Results';
import { ProductContextStrip } from '@/components/app/product-images/ProductContextStrip';
import { ProductImagesStickyBar } from '@/components/app/product-images/ProductImagesStickyBar';
import type { PIStep, UserProduct, DetailSettings } from '@/components/app/product-images/types';

const STEP_DEFS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Scenes', icon: Layers },
  { number: 3, label: 'Details', icon: Settings },
  { number: 4, label: 'Review', icon: ClipboardCheck },
  { number: 5, label: 'Generate', icon: Sparkles },
  { number: 6, label: 'Results', icon: CheckCircle },
];

// Map detail block keys to the detail settings fields they own
const BLOCK_FIELD_MAP: Record<string, (keyof DetailSettings)[]> = {
  background: ['backgroundTone', 'shadowStyle', 'compositionFraming', 'negativeSpace'],
  visualDirection: ['mood', 'sceneIntensity', 'productProminence', 'lightingStyle'],
  sceneEnvironment: ['environmentType', 'surfaceType', 'stylingDensity', 'props'],
  personDetails: ['presentation', 'ageRange', 'skinTone', 'handStyle', 'nails', 'jewelryVisible', 'cropType', 'expression', 'hairVisibility'],
  actionDetails: ['actionType', 'actionIntensity'],
  detailFocus: ['focusArea', 'cropIntensity', 'detailStyle'],
  angleSelection: ['requestedViews', 'numberOfViews'],
  packagingDetails: ['packagingType', 'packagingState', 'packagingComposition', 'packagingFocus', 'referenceStrength'],
  productSize: ['productSize'],
  branding: ['brandingVisibility'],
  layout: ['layoutSpace'],
  consistency: ['consistency'],
};

export default function ProductImages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, openBuyModal, setBalanceFromServer, refreshBalance } = useCredits();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<PIStep>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<DetailSettings>({ aspectRatio: '1:1', quality: 'high', imageCount: '1' });

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

  // Derived credit calculation
  const imageCount = parseInt(details.imageCount || '1', 10);
  const quality = details.quality || 'high';
  const creditsPerImage = quality === 'standard' ? 3 : 6;
  const totalImages = selectedProducts.length * selectedScenes.length * imageCount;
  const totalCredits = totalImages * creditsPerImage;
  const canAfford = balance >= totalCredits;

  // Stale detail cleanup when scenes change
  useEffect(() => {
    const triggered = getTriggeredBlocks(selectedSceneIds, ALL_SCENES, selectedProducts.length);
    const staleKeys: (keyof DetailSettings)[] = [];
    for (const [block, fields] of Object.entries(BLOCK_FIELD_MAP)) {
      if (!triggered.includes(block)) {
        for (const field of fields) {
          if (details[field]) staleKeys.push(field);
        }
      }
    }
    if (staleKeys.length > 0) {
      const cleaned = { ...details };
      for (const key of staleKeys) {
        delete cleaned[key];
      }
      setDetails(cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSceneIds, selectedProducts.length]);

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
    if (!canAfford) { openBuyModal(); return; }

    setStep(5);
    setCompletedJobs(0);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(4); return; }

    const batchId = crypto.randomUUID();
    const newJobMap = new Map<string, string>();
    let lastBalance: number | null = null;
    const aspectRatio = details.aspectRatio || '1:1';
    const imgCount = parseInt(details.imageCount || '1', 10);

    for (const product of selectedProducts) {
      const base64Image = await convertImageToBase64(product.image_url);

      for (const scene of selectedScenes) {
        for (let i = 0; i < imgCount; i++) {
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
            quality,
            aspectRatio,
            batch_id: batchId,
          };

          await paceDelay(newJobMap.size);

          const result = await enqueueWithRetry(
            { jobType: 'workflow', payload, imageCount: 1, quality, hasModel: false, hasScene: false, skipWake: true },
            token,
          );

          if (!isEnqueueError(result)) {
            const key = `${product.id}_${scene.id}_${i}`;
            newJobMap.set(key, result.jobId);
            lastBalance = result.newBalance;
            injectActiveJob(queryClient, {
              jobId: result.jobId,
              workflow_name: 'Product Images',
              workflow_slug: 'product-images',
              product_name: product.title,
              job_type: 'workflow',
              quality,
              imageCount: 1,
              batch_id: batchId,
            });
          } else if (result.type === 'insufficient_credits') {
            toast.error(result.message);
            break;
          }
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

    startPolling(newJobMap);
  }, [selectedProducts, selectedScenes, canAfford, details, buildInstruction, openBuyModal, setBalanceFromServer, queryClient, quality]);

  const startPolling = useCallback((activeJobMap: Map<string, string>) => {
    const jobIds = Array.from(activeJobMap.values());
    const productMap = new Map<string, string>();
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

  useEffect(() => {
    return () => { if (pollingRef.current) clearTimeout(pollingRef.current); };
  }, []);

  const canNavigateTo = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return selectedProductIds.size > 0;
    if (s === 3) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    if (s === 4) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    return false;
  };

  const canProceed = (() => {
    switch (step) {
      case 1: return selectedProductIds.size > 0;
      case 2: return selectedSceneIds.size > 0;
      case 3: return true;
      case 4: return canAfford && totalImages > 0;
      default: return false;
    }
  })();

  const handleNext = () => {
    switch (step) {
      case 1: setStep(2); break;
      case 2: setStep(3); break;
      case 3: setStep(4); break;
      case 4: handleGenerate(); break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 2: setStep(1); break;
      case 3: setStep(2); break;
      case 4: setStep(3); break;
    }
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

      {/* Product context strip on Steps 2-4 */}
      {step >= 2 && step <= 4 && selectedProducts.length > 0 && (
        <ProductContextStrip products={selectedProducts} onChangeProducts={() => setStep(1)} />
      )}

      <div className="mt-6">
        {step === 1 && (
          <ProductImagesStep1Products
            products={userProducts}
            isLoading={isLoadingProducts}
            selectedIds={selectedProductIds}
            onSelectionChange={setSelectedProductIds}
            onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
          />
        )}

        {step === 2 && (
          <ProductImagesStep2Scenes
            selectedSceneIds={selectedSceneIds}
            onSelectionChange={setSelectedSceneIds}
            selectedProducts={selectedProducts}
          />
        )}

        {step === 3 && (
          <ProductImagesStep3Details
            selectedSceneIds={selectedSceneIds}
            productCount={selectedProducts.length}
            details={details}
            onDetailsChange={setDetails}
          />
        )}

        {step === 4 && (
          <ProductImagesStep4Review
            selectedProducts={selectedProducts}
            selectedSceneIds={selectedSceneIds}
            details={details}
            creditsPerImage={creditsPerImage}
            balance={balance}
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

      {/* Sticky bottom bar for Steps 1-4 */}
      {step >= 1 && step <= 4 && (
        <ProductImagesStickyBar
          step={step}
          productCount={selectedProducts.length}
          sceneCount={selectedScenes.length}
          totalImages={totalImages}
          totalCredits={totalCredits}
          balance={balance}
          canProceed={canProceed}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
