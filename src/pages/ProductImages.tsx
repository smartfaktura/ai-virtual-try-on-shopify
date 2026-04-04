import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEOHead';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { Package, Layers, SlidersHorizontal, Paintbrush, ClipboardCheck, Sparkles, CheckCircle, Search, Check, LayoutGrid, List, Gem } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { toast } from '@/lib/brandedToast';
import { ALL_SCENES } from '@/components/app/product-images/sceneData';
import { getTriggeredBlocks } from '@/components/app/product-images/detailBlockConfig';
import { AddProductModal } from '@/components/app/AddProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ProductImagesStep2Scenes } from '@/components/app/product-images/ProductImagesStep2Scenes';
import { ProductImagesStep3Settings } from '@/components/app/product-images/ProductImagesStep3Settings';
import { ProductImagesStep3Details } from '@/components/app/product-images/ProductImagesStep3Details';
import { ProductImagesStep4Review } from '@/components/app/product-images/ProductImagesStep4Review';
import { ProductImagesStep5Generating } from '@/components/app/product-images/ProductImagesStep5Generating';
import { ProductImagesStep6Results } from '@/components/app/product-images/ProductImagesStep6Results';
import { ProductContextStrip } from '@/components/app/product-images/ProductContextStrip';
import { ProductImagesStickyBar } from '@/components/app/product-images/ProductImagesStickyBar';
import { ProductImagesStep3Props } from '@/components/app/product-images/ProductImagesStep3Props';
import { useUserModels } from '@/hooks/useUserModels';
import { useCustomModels } from '@/hooks/useCustomModels';
import type { PIStep, UserProduct, DetailSettings } from '@/components/app/product-images/types';

const STEP_DEFS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Scenes', icon: Layers },
  { number: 3, label: 'Refine', icon: Paintbrush },
  { number: 4, label: 'Props', icon: Gem },
  { number: 5, label: 'Settings', icon: SlidersHorizontal },
  { number: 6, label: 'Review', icon: ClipboardCheck },
  { number: 7, label: 'Generate', icon: Sparkles },
  { number: 8, label: 'Results', icon: CheckCircle },
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

  const INITIAL_DETAILS: DetailSettings = { aspectRatio: '1:1', quality: 'high', imageCount: '1' };

  const [step, setStep] = useState<PIStep>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<DetailSettings>(INITIAL_DETAILS);
  const [propProductIds, setPropProductIds] = useState<Set<string>>(new Set());
  const prevProductIdsRef = useRef<string | null>(null);

  // Load models for Step 4
  const { asProfiles: userModelProfiles } = useUserModels();
  const { asProfiles: globalModelProfiles } = useCustomModels();

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const MAX_PRODUCTS = 20;

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

    setStep(6);
    setCompletedJobs(0);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(5); return; }

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
      setStep(5);
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
          setStep(7);
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
    if (s === 5) return selectedProductIds.size > 0 && selectedSceneIds.size > 0;
    return false;
  };

  const canProceed = (() => {
    switch (step) {
      case 1: return selectedProductIds.size > 0;
      case 2: return selectedSceneIds.size > 0;
      case 3: return true;
      case 4: return true;
      case 5: return canAfford && totalImages > 0;
      default: return false;
    }
  })();

  const handleNext = () => {
    switch (step) {
      case 1: setStep(2); break;
      case 2: setStep(3); break;
      case 3: setStep(4); break;
      case 4: setStep(5); break;
      case 5: handleGenerate(); break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 2: setStep(1); break;
      case 3: setStep(2); break;
      case 4: setStep(3); break;
      case 5: setStep(4); break;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <SEOHead title="Product Images — VOVV" description="Generate product images" />
      <PageHeader title="Product Images" subtitle="Generate stunning product visuals across multiple scene types."><span /></PageHeader>

      {step <= 5 && (
        <CatalogStepper
          steps={STEP_DEFS}
          currentStep={step}
          canNavigateTo={canNavigateTo}
          onStepClick={(s) => setStep(s as PIStep)}
        />
      )}

      {/* Product context strip on Steps 2-5 */}
      {step >= 2 && step <= 5 && selectedProducts.length > 0 && (
        <ProductContextStrip products={selectedProducts} onChangeProducts={() => setStep(1)} />
      )}

      <div className="mt-6">
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

                if (productViewMode === 'list') {
                  return (
                    <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                      {filtered.map(up => {
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
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filtered.map(up => {
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
            userModels={userModelProfiles}
            globalModels={globalModelProfiles}
          />
        )}

        {step === 4 && (
          <ProductImagesStep3Settings
            details={details}
            onDetailsChange={setDetails}
            productCount={selectedProducts.length}
            sceneCount={selectedScenes.length}
          />
        )}

        {step === 5 && (
          <ProductImagesStep4Review
            selectedProducts={selectedProducts}
            selectedSceneIds={selectedSceneIds}
            details={details}
            creditsPerImage={creditsPerImage}
            balance={balance}
            onEditStep={(s) => setStep(s as PIStep)}
          />
        )}

        {step === 6 && (
          <ProductImagesStep5Generating
            totalJobs={jobMap.size}
            completedJobs={completedJobs}
            productCount={selectedProducts.length}
          />
        )}

        {step === 7 && (
          <ProductImagesStep6Results
            results={results}
            onGenerateMore={() => { setStep(2); setResults(new Map()); setJobMap(new Map()); }}
            onGoToLibrary={() => navigate('/app/library')}
          />
        )}
      </div>

      {/* Sticky bottom bar for Steps 1-5 */}
      {step >= 1 && step <= 5 && (
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
