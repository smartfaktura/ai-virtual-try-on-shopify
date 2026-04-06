import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEOHead';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { Package, Layers, Paintbrush, ClipboardCheck, Sparkles, CheckCircle, Search, Check, LayoutGrid, List, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { toast } from '@/lib/brandedToast';
import { ALL_SCENES } from '@/components/app/product-images/sceneData';
import { CATEGORY_KEYWORDS } from '@/components/app/product-images/ProductImagesStep2Scenes';
import { getTriggeredBlocks, BLOCK_FIELD_MAP } from '@/components/app/product-images/detailBlockConfig';
import { AddProductModal } from '@/components/app/AddProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ProductContextStrip } from '@/components/app/product-images/ProductContextStrip';
import { ProductImagesStickyBar } from '@/components/app/product-images/ProductImagesStickyBar';

// Lazy-load step components for faster initial render
const ProductImagesStep2Scenes = lazy(() => import('@/components/app/product-images/ProductImagesStep2Scenes'));
const ProductImagesStep3Refine = lazy(() => import('@/components/app/product-images/ProductImagesStep3Refine'));
const ProductImagesStep4Review = lazy(() => import('@/components/app/product-images/ProductImagesStep4Review'));
const ProductImagesStep5Generating = lazy(() => import('@/components/app/product-images/ProductImagesStep5Generating'));
const ProductImagesStep6Results = lazy(() => import('@/components/app/product-images/ProductImagesStep6Results'));

import { useUserModels } from '@/hooks/useUserModels';
import { useCustomModels } from '@/hooks/useCustomModels';
import { mockModels } from '@/data/mockData';
import { useProductAnalysis } from '@/hooks/useProductAnalysis';
import type { PIStep, UserProduct, DetailSettings, ProductAnalysis } from '@/components/app/product-images/types';
import { buildDynamicPrompt } from '@/lib/productImagePromptBuilder';

const STEP_DEFS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Scenes', icon: Layers },
  { number: 3, label: 'Refine', icon: Paintbrush },
  { number: 4, label: 'Review', icon: ClipboardCheck },
  { number: 5, label: 'Generate', icon: Sparkles },
  { number: 6, label: 'Results', icon: CheckCircle },
];


export default function ProductImages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, openBuyModal, setBalanceFromServer, refreshBalance } = useCredits();
  const queryClient = useQueryClient();
  const { analyses, isAnalyzing, analyzeProducts } = useProductAnalysis();

  const INITIAL_DETAILS: DetailSettings = {
    aspectRatio: '1:1', quality: 'high', imageCount: '1',
    backgroundTone: 'auto', negativeSpace: 'auto', surfaceType: 'auto',
    lightingStyle: 'soft-diffused', shadowStyle: 'natural', mood: 'auto',
    brandingVisibility: 'product-accent',
  };

  const [step, setStep] = useState<PIStep>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<DetailSettings>(INITIAL_DETAILS);
  const [showLastSettingsBanner, setShowLastSettingsBanner] = useState(false);
  const [lastSettingsCategory, setLastSettingsCategory] = useState<string | null>(null);
  const prevProductIdsRef = useRef<string | null>(null);

  // Load models for Refine step
  // Defer model queries until Refine step
  const { asProfiles: userModelProfiles } = useUserModels({ enabled: step >= 3 });
  const { asProfiles: customModelProfiles } = useCustomModels({ enabled: step >= 3 });
  const globalModelProfiles = useMemo(
    () => [...mockModels, ...(customModelProfiles || [])],
    [customModelProfiles]
  );

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(25);
  const MAX_PRODUCTS = 20;

  // Generation state
  const [jobMap, setJobMap] = useState<Map<string, string>>(new Map());
  const [completedJobs, setCompletedJobs] = useState(0);
  const [results, setResults] = useState<Map<string, { images: string[]; productName: string }>>(new Map());
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expectedJobCount, setExpectedJobCount] = useState(0);
  const [enqueuedCount, setEnqueuedCount] = useState(0);
  const [completedJobIds, setCompletedJobIds] = useState<Set<string>>(new Set());
  const [failedJobIds, setFailedJobIds] = useState<Set<string>>(new Set());
  const pollingStartRef = useRef<number>(0);

  const resetGenerationState = useCallback(() => {
    setJobMap(new Map());
    setCompletedJobs(0);
    setResults(new Map());
    setExpectedJobCount(0);
    setEnqueuedCount(0);
    setCompletedJobIds(new Set());
    setFailedJobIds(new Set());
    if (pollingRef.current) clearTimeout(pollingRef.current);
  }, []);

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

  // Primary category for outfit defaults
  const primaryCategory = useMemo(() => {
    for (const p of selectedProducts) {
      // Check live analyses map first
      const liveAnalysis = analyses[p.id];
      if (liveAnalysis?.category) return liveAnalysis.category;
      // Then cached analysis_json
      const analysis = p.analysis_json as any;
      if (analysis?.category) return analysis.category as string;
    }
    // Keyword fallback: map raw product_type to category ID
    const combined = selectedProducts.map(p =>
      `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase()
    ).join(' ');
    for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) return catId;
    }
    return undefined;
  }, [selectedProducts, analyses]);

  // Memoize hasMultipleCategories
  const hasMultipleCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of selectedProducts) {
      // Check live analyses first
      const liveAnalysis = analyses[p.id];
      if (liveAnalysis?.category) { cats.add(liveAnalysis.category); continue; }
      // Then cached analysis_json
      const analysis = p.analysis_json as any;
      if (analysis?.category) { cats.add(analysis.category); continue; }
      // Keyword fallback to resolve raw product_type to category ID
      const combined = `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase();
      let resolved = 'other';
      for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) { resolved = catId; break; }
      }
      cats.add(resolved);
    }
    return cats.size > 1;
  }, [selectedProducts, analyses]);

  // Check for last-used settings when entering Refine step
  useEffect(() => {
    if (step === 3 && primaryCategory) {
      const key = `pi_last_details_${primaryCategory}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setLastSettingsCategory(primaryCategory);
          setShowLastSettingsBanner(true);
        }
      } catch {}
    } else {
      setShowLastSettingsBanner(false);
    }
  }, [step, primaryCategory]);

  // Save details when moving from Refine to Review
  useEffect(() => {
    if (step === 4 && primaryCategory) {
      try {
        localStorage.setItem(`pi_last_details_${primaryCategory}`, JSON.stringify(details));
      } catch {}
    }
  }, [step, primaryCategory, details]);

  const loadLastSettings = useCallback(() => {
    if (!lastSettingsCategory) return;
    try {
      const saved = localStorage.getItem(`pi_last_details_${lastSettingsCategory}`);
      if (saved) {
        const parsed = JSON.parse(saved) as DetailSettings;
        // Keep format settings from current session but load everything else
        setDetails({ ...parsed, aspectRatio: details.aspectRatio, quality: details.quality, imageCount: details.imageCount });
      }
    } catch {}
    setShowLastSettingsBanner(false);
  }, [lastSettingsCategory, details.aspectRatio, details.quality, details.imageCount]);

  const imageCount = parseInt(details.imageCount || '1', 10);
  const quality = details.quality || 'high';
  const creditsPerImage = quality === 'standard' ? 3 : 6;
  const totalImages = selectedProducts.length * selectedScenes.length * imageCount;
  const totalCredits = totalImages * creditsPerImage;
  const canAfford = balance >= totalCredits;

  // Ref for wizard content area
  const wizardContentRef = useRef<HTMLDivElement>(null);

  // Scroll wizard into view on step change
  useEffect(() => {
    if (wizardContentRef.current) {
      wizardContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(25);
  }, [productSearch]);

  // Reset downstream state when product selection changes
  useEffect(() => {
    const key = Array.from(selectedProductIds).sort().join(',');
    if (prevProductIdsRef.current !== null && prevProductIdsRef.current !== key) {
      setSelectedSceneIds(new Set());
      setDetails(INITIAL_DETAILS);
      if (step > 1) setStep(1);
    }
    prevProductIdsRef.current = key;
  }, [selectedProductIds]);

  // Stale detail cleanup when scenes change
  useEffect(() => {
    const triggered = getTriggeredBlocks(selectedSceneIds, ALL_SCENES, selectedProducts.length);
    const staleKeys: (keyof DetailSettings)[] = [];
    for (const [block, fields] of Object.entries(BLOCK_FIELD_MAP)) {
      if (!triggered.includes(block)) {
        for (const field of fields) {
          if (details[field as keyof DetailSettings]) staleKeys.push(field as keyof DetailSettings);
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

  // Trigger product analysis when moving from step 1 to step 2
  useEffect(() => {
    if (step === 2 && selectedProducts.length > 0) {
      analyzeProducts(selectedProducts);
    }
  }, [step, selectedProducts, analyzeProducts]);

  // Resolve selected model gender for prompt builder
  const selectedModelGender = useMemo(() => {
    if (!details.selectedModelId) return undefined;
    const allModels = [...(userModelProfiles || []), ...(globalModelProfiles || [])];
    const model = allModels.find(m => m.modelId === details.selectedModelId);
    return model?.gender;
  }, [details.selectedModelId, userModelProfiles, globalModelProfiles]);

  // Build instruction from scene + details — use live analyses map instead of stale DB row
  const buildInstruction = useCallback((scene: typeof ALL_SCENES[0], product: UserProduct) => {
    const analysis = analyses[product.id] || (product as any).analysis_json as ProductAnalysis | null;
    return buildDynamicPrompt(scene, product, analysis, details, selectedModelGender);
  }, [details, analyses, selectedModelGender]);

  // Generation handler
  const handleGenerate = useCallback(async () => {
    if (!canAfford) { openBuyModal(); return; }

    const imgCount = parseInt(details.imageCount || '1', 10);
    const totalExpected = selectedProducts.length * selectedScenes.length * imgCount;
    setExpectedJobCount(totalExpected);
    setEnqueuedCount(0);
    setCompletedJobs(0);
    setCompletedJobIds(new Set());
    setFailedJobIds(new Set());
    setStep(5);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(4); return; }

    // Resolve model image if selectedModelId is set
    let modelRef: { name: string; gender: string; ethnicity: string; bodyType: string; ageRange: string; imageUrl: string } | undefined;
    if (details.selectedModelId) {
      const allModels = [...(userModelProfiles || []), ...(globalModelProfiles || [])];
      const found = allModels.find(m => m.modelId === details.selectedModelId);
      if (found) {
        const modelBase64 = await convertImageToBase64(found.sourceImageUrl || found.previewUrl);
        modelRef = {
          name: found.name,
          gender: found.gender || '',
          ethnicity: found.ethnicity || '',
          bodyType: found.bodyType || '',
          ageRange: found.ageRange || '',
          imageUrl: modelBase64,
        };
      }
    }

    const WORKFLOW_ID = '4bb79966-42f1-4720-af45-183aa954e8e1';
    const batchId = crypto.randomUUID();
    const newJobMap = new Map<string, string>();
    let lastBalance: number | null = null;
    const aspectRatio = details.aspectRatio || '1:1';
    // imgCount already declared above

    let aborted = false;
    for (const product of selectedProducts) {
      if (aborted) break;
      const base64Image = await convertImageToBase64(product.image_url);
      const productAnalysis = analyses[product.id] || (product as any).analysis_json || null;

      // Build extra_variations from selected scenes with full prompt instructions
      const extraVariations = selectedScenes.map(scene => ({
        label: scene.title,
        instruction: buildInstruction(scene, product),
        aspect_ratio: details.sceneAspectOverrides?.[scene.id] || undefined,
      }));

      // Each scene gets its own job (1 image per job for reliability)
      for (let sceneIdx = 0; sceneIdx < selectedScenes.length; sceneIdx++) {
        const scene = selectedScenes[sceneIdx];
        for (let i = 0; i < imgCount; i++) {
          // Resolve prop products for this scene
          const propProductIds = details.sceneProps?.[scene.id] || [];
          const propProducts = propProductIds
            .map(pid => userProducts.find(p => p.id === pid))
            .filter(Boolean)
            .map(p => p!);
          const additionalProducts = propProducts.length > 0
            ? await Promise.all(propProducts.map(async pp => ({
                title: pp.title,
                productType: pp.product_type,
                description: pp.description,
                imageUrl: await convertImageToBase64(pp.image_url),
              })))
            : undefined;

          const payload: Record<string, unknown> = {
            workflow_id: WORKFLOW_ID,
            workflow_name: 'Product Images',
            workflow_slug: 'product-images',
            product: {
              title: product.title,
              productType: productAnalysis?.category || product.product_type,
              description: product.description,
              dimensions: product.dimensions || undefined,
              imageUrl: base64Image,
              analysis: productAnalysis || undefined,
            },
            product_name: product.title,
            product_image_url: product.image_url,
            extra_variations: [extraVariations[sceneIdx]],
            selected_variations: [0],
            ...(additionalProducts ? { additional_products: additionalProducts } : {}),
            ...(modelRef ? { model: modelRef } : {}),
            ...(details.packagingReferenceUrl ? { packaging_reference_url: details.packagingReferenceUrl } : {}),
            quality,
            aspectRatio: details.sceneAspectOverrides?.[scene.id] || aspectRatio,
            batch_id: batchId,
            scene_name: scene.title,
            batch_outfit_lock: true,
            batch_size: selectedScenes.length,
          };

          await paceDelay(newJobMap.size);

          const result = await enqueueWithRetry(
            { jobType: 'workflow', payload, imageCount: 1, quality, hasModel: !!modelRef, hasScene: false, skipWake: true },
            token,
          );

          if (!isEnqueueError(result)) {
            const key = `${product.id}_${scene.id}_${i}`;
            newJobMap.set(key, result.jobId);
            lastBalance = result.newBalance;
            setJobMap(new Map(newJobMap));
            setEnqueuedCount(newJobMap.size);
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
            aborted = true;
            break;
          }
        }
        if (aborted) break;
      }
      if (aborted) break;
    }

    if (newJobMap.size === 0) {
      toast.error('Could not queue any jobs');
      setStep(4);
      return;
    }

    if (lastBalance !== null) setBalanceFromServer(lastBalance);
    setJobMap(new Map(newJobMap));
    setEnqueuedCount(newJobMap.size);
    sendWake(token);

    startPolling(newJobMap);
  }, [selectedProducts, selectedScenes, canAfford, details, buildInstruction, openBuyModal, setBalanceFromServer, queryClient, quality, analyses, userProducts, userModelProfiles, globalModelProfiles]);

  const finishWithResults = useCallback((jobs: any[], productMap: Map<string, string>) => {
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
  }, [selectedProducts, refreshBalance]);

  const startPolling = useCallback((activeJobMap: Map<string, string>) => {
    const jobIds = Array.from(activeJobMap.values());
    const productMap = new Map<string, string>();
    for (const [key, jobId] of activeJobMap.entries()) {
      const productId = key.split('_')[0];
      productMap.set(jobId, productId);
    }
    pollingStartRef.current = Date.now();
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

    const poll = async () => {
      try {
        // Hard timeout — force transition to results
        if (Date.now() - pollingStartRef.current > TIMEOUT_MS) {
          const { data: finalJobs } = await supabase
            .from('generation_queue')
            .select('id, status, result')
            .in('id', jobIds);
          toast.warning('Generation timed out — showing available results.');
          finishWithResults(finalJobs || [], productMap);
          return;
        }

        const { data: jobs } = await supabase
          .from('generation_queue')
          .select('id, status, result')
          .in('id', jobIds);

        if (!jobs) { pollingRef.current = setTimeout(poll, 3000); return; }

        const done = jobs.filter(j => j.status === 'completed' || j.status === 'failed');
        const newCompleted = new Set<string>();
        const newFailed = new Set<string>();
        for (const j of done) {
          if (j.status === 'completed') newCompleted.add(j.id);
          if (j.status === 'failed') newFailed.add(j.id);
        }
        setCompletedJobs(done.length);
        setCompletedJobIds(newCompleted);
        setFailedJobIds(newFailed);

        if (done.length >= jobIds.length) {
          if (newFailed.size > 0) {
            toast.warning(`${newFailed.size} image${newFailed.size !== 1 ? 's' : ''} failed — credits refunded.`);
          }
          finishWithResults(jobs, productMap);
          return;
        }

        pollingRef.current = setTimeout(poll, 3000);
      } catch {
        pollingRef.current = setTimeout(poll, 5000);
      }
    };

    pollingRef.current = setTimeout(poll, 2000);
  }, [finishWithResults]);

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
      case 3: {
        // Auto-select model if on-model scenes exist but no model is selected
        const hasOnModelScenes = selectedScenes.some(s =>
          s.triggerBlocks?.some(b => b === 'personDetails' || b === 'actionDetails')
        );
        if (hasOnModelScenes && !details.selectedModelId && globalModelProfiles.length > 0) {
          setDetails(prev => ({ ...prev, selectedModelId: globalModelProfiles[0].modelId }));
          toast.info('Smart defaults applied — we auto-selected a model and best settings for your scenes. You can go back to Refine to customize.');
        }
        setStep(4);
        break;
      }
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
    <div className="space-y-6 pb-24">
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

      {step >= 2 && step <= 4 && selectedProducts.length > 0 && (
        <ProductContextStrip products={selectedProducts} onChangeProducts={() => setStep(1)} />
      )}

      <div className="mt-2" ref={wizardContentRef}>
        {step === 1 && (
          <>
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                  const filtered = userProducts.filter(p =>
                    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.product_type.toLowerCase().includes(productSearch.toLowerCase())
                  );
                  setSelectedProductIds(new Set(filtered.slice(0, MAX_PRODUCTS).map(p => p.id)));
                }}>Select All</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedProductIds(new Set())}>Clear</Button>
                <div className="flex border border-border rounded-md overflow-hidden">
                  <button onClick={() => setProductViewMode('grid')} className={cn('p-1.5 transition-colors', productViewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setProductViewMode('list')} className={cn('p-1.5 transition-colors', productViewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {selectedProductIds.size > 0 && (
                <div className="flex gap-2 items-center">
                  <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'}>{selectedProductIds.size} selected</Badge>
                  <span className="text-xs text-muted-foreground">(max {MAX_PRODUCTS})</span>
                </div>
              )}

              {/* Empty state */}
              {!isLoadingProducts && userProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <Package className="w-10 h-10 text-muted-foreground/40" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-foreground">No products yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs">Add your first product to start generating professional visuals across multiple scenes.</p>
                  </div>
                  <Button size="sm" onClick={() => setAddProductOpen(true)} className="gap-1.5">
                    <Package className="w-3.5 h-3.5" />Add Your First Product
                  </Button>
                </div>
              ) : (
              (() => {
                const filtered = userProducts.filter(p =>
                  p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.product_type.toLowerCase().includes(productSearch.toLowerCase())
                );

                if (filtered.length === 0 && productSearch) {
                  return <p className="text-center text-sm text-muted-foreground py-6">No products match "{productSearch}"</p>;
                }

                const visible = filtered.slice(0, visibleCount);
                const remaining = filtered.length - visibleCount;

                const loadMoreBtn = remaining > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setVisibleCount(v => v + 25)}>
                      Show more ({remaining} remaining)
                    </Button>
                  </div>
                );

                if (productViewMode === 'list') {
                  return (
                    <div className="space-y-1">
                      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1">
                        {visible.map(up => {
                          const isSelected = selectedProductIds.has(up.id);
                          const isDisabled = !isSelected && selectedProductIds.size >= MAX_PRODUCTS;
                          return (
                            <button key={up.id} type="button" disabled={isDisabled} onClick={() => {
                              const s = new Set(selectedProductIds);
                              if (s.has(up.id)) s.delete(up.id); else if (s.size < MAX_PRODUCTS) s.add(up.id);
                              setSelectedProductIds(s);
                            }} className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left',
                              isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                              isDisabled && 'opacity-40 cursor-not-allowed'
                            )}>
                              <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{up.title}</p>
                                {up.product_type && <p className="text-[10px] text-muted-foreground truncate">{up.product_type}</p>}
                              </div>
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                              )}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {loadMoreBtn}
                    </div>
                  );
                }

                return (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {visible.map(up => {
                        const isSelected = selectedProductIds.has(up.id);
                        const isDisabled = !isSelected && selectedProductIds.size >= MAX_PRODUCTS;
                        return (
                          <button key={up.id} type="button" disabled={isDisabled} onClick={() => {
                            const s = new Set(selectedProductIds);
                            if (s.has(up.id)) s.delete(up.id); else if (s.size < MAX_PRODUCTS) s.add(up.id);
                            setSelectedProductIds(s);
                          }} className={cn(
                            'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                            isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                            isDisabled && 'opacity-40 cursor-not-allowed'
                          )}>
                            <div className={cn(
                              'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                              isSelected ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                            )}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                            <div className="px-1.5 py-1.5 bg-card">
                              <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                              {up.product_type && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>}
                            </div>
                          </button>
                        );
                      })}
                      <button type="button" onClick={() => setAddProductOpen(true)} className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all aspect-square text-muted-foreground">
                        <Package className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-[10px] font-medium">Add New</span>
                      </button>
                    </div>
                    {loadMoreBtn}
                  </>
                );
              })()
              )}
            </div>
            <AddProductModal
              open={addProductOpen}
              onOpenChange={setAddProductOpen}
              onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
            />
          </>
        )}

        {step >= 2 && step <= 6 && (
          <Suspense fallback={<div className="space-y-4 py-8"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div></div>}>
            {step === 2 && (
              <ProductImagesStep2Scenes
                selectedSceneIds={selectedSceneIds}
                onSelectionChange={setSelectedSceneIds}
                selectedProducts={selectedProducts}
                productAnalyses={analyses}
              />
            )}

            {step === 3 && (
              <div>
                {showLastSettingsBanner && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03] mb-4">
                    <History className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground flex-1">Load your last settings for <span className="font-medium text-foreground">{lastSettingsCategory}</span>?</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowLastSettingsBanner(false)}>Dismiss</Button>
                    <Button size="sm" className="h-7 text-xs" onClick={loadLastSettings}>Apply</Button>
                  </div>
                )}
                <ProductImagesStep3Refine
                  selectedSceneIds={selectedSceneIds}
                  productCount={selectedProducts.length}
                  details={details}
                  onDetailsChange={setDetails}
                  userModels={userModelProfiles}
                  globalModels={globalModelProfiles}
                  selectedScenes={selectedScenes}
                  allProducts={userProducts}
                  selectedProductIds={selectedProductIds}
                  hasMultipleCategories={hasMultipleCategories}
                  primaryCategory={primaryCategory}
                />
              </div>
            )}

            {step === 4 && (
              <ProductImagesStep4Review
                selectedProducts={selectedProducts}
                selectedSceneIds={selectedSceneIds}
                details={details}
                balance={balance}
                onEditStep={(s) => setStep(s as PIStep)}
                onDetailsChange={setDetails}
                allProducts={userProducts}
                selectedProductIds={selectedProductIds}
              />
            )}

            {step === 5 && (
              <ProductImagesStep5Generating
                totalJobs={jobMap.size}
                completedJobs={completedJobs}
                productCount={selectedProducts.length}
                products={selectedProducts}
                jobMap={jobMap}
                completedJobIds={completedJobIds}
                failedJobIds={failedJobIds}
                enqueuedJobs={enqueuedCount}
                expectedJobCount={expectedJobCount}
                onViewResults={() => {
                  if (pollingRef.current) clearTimeout(pollingRef.current);
                  // Fetch final state and transition
                  const jobIds = Array.from(jobMap.values());
                  supabase.from('generation_queue').select('id, status, result').in('id', jobIds).then(({ data }) => {
                    const productMap = new Map<string, string>();
                    for (const [key, jobId] of jobMap.entries()) productMap.set(jobId, key.split('_')[0]);
                    finishWithResults(data || [], productMap);
                  });
                }}
              />
            )}

            {step === 6 && (
              <ProductImagesStep6Results
                results={results}
                onGenerateMore={() => { resetGenerationState(); setStep(2); }}
                onGoToLibrary={() => navigate('/app/library')}
              />
            )}
          </Suspense>
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
