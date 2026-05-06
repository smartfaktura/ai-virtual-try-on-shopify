import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEOHead';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { MultiProductProgressBanner } from '@/components/app/MultiProductProgressBanner';
import { Package, Layers, Paintbrush, Sparkles, Star, Grid3x3, ArrowDownRight, CircleDot, Shuffle, Loader2, CheckCircle, Upload, FlaskConical, Image as ImageIcon, PartyPopper } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, paceDelay } from '@/lib/enqueueGeneration';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { injectActiveJob } from '@/lib/optimisticJobInjection';
import { toast } from '@/lib/brandedToast';
import { useProductImageScenes, dbToFrontend } from '@/hooks/useProductImageScenes';
import { useProductAnalysis } from '@/hooks/useProductAnalysis';
import { buildBundlePrompt, type ArrangementStyle, type BundleProduct } from '@/lib/bundlePromptBuilder';
import { BundleProductPicker } from '@/components/app/bundle-visuals/BundleProductPicker';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct, ProductImageScene } from '@/components/app/product-images/types';

type BundleStep = 1 | 2 | 3 | 4 | 5;

const STEP_DEFS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Shots', icon: Layers },
  { number: 3, label: 'Setup', icon: Paintbrush },
  { number: 4, label: 'Generate', icon: Sparkles },
];

const CREDITS_PER_IMAGE = 6;
const MAX_PRODUCTS = 5;
const MIN_PRODUCTS = 2;

const ARRANGEMENT_OPTIONS: Array<{ value: ArrangementStyle; label: string; icon: typeof Grid3x3; description: string }> = [
  { value: 'grid', label: 'Grid', icon: Grid3x3, description: 'Clean, structured layout' },
  { value: 'cascade', label: 'Cascade', icon: ArrowDownRight, description: 'Diagonal waterfall flow' },
  { value: 'nested', label: 'Nested', icon: Package, description: 'Tightly curated collection' },
  { value: 'radial', label: 'Radial', icon: CircleDot, description: 'Hero center, others orbit' },
  { value: 'natural', label: 'Natural', icon: Shuffle, description: 'Editorial lifestyle scatter' },
];

export default function BundleVisuals() {
  const { user } = useAuth();
  const { balance, setBalanceFromServer } = useCredits();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<BundleStep>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [heroProductId, setHeroProductId] = useState<string | null>(null);
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [arrangement, setArrangement] = useState<ArrangementStyle>('natural');
  const [selectedRatios, setSelectedRatios] = useState<string[]>(['1:1']);
  const [customNote, setCustomNote] = useState('');
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);

  // Generation state
  const [jobMap, setJobMap] = useState(new Map<string, string>());
  const [expectedJobCount, setExpectedJobCount] = useState(0);
  const [enqueuedCount, setEnqueuedCount] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load user products
  const { data: userProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_products')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      return (data || []) as UserProduct[];
    },
    enabled: !!user?.id,
  });

  // Load bundle scenes (category_collection = 'bundle')
  const { allScenes, isLoading: isLoadingScenes } = useProductImageScenes();

  const bundleScenes = useMemo(
    () => allScenes.filter(s => s.categoryCollection === 'bundle'),
    [allScenes]
  );

  // Analyses for selected products
  const selectedProducts = useMemo(
    () => userProducts.filter(p => selectedProductIds.has(p.id)),
    [userProducts, selectedProductIds]
  );
  const { analyses, analyzeProducts } = useProductAnalysis();

  // Trigger analysis when products change
  useEffect(() => {
    if (selectedProducts.length > 0) {
      analyzeProducts(selectedProducts);
    }
  }, [selectedProducts, analyzeProducts]);

  // Auto-set first selected product as hero
  useEffect(() => {
    if (selectedProductIds.size > 0 && (!heroProductId || !selectedProductIds.has(heroProductId))) {
      setHeroProductId(Array.from(selectedProductIds)[0]);
    }
    if (selectedProductIds.size === 0) setHeroProductId(null);
  }, [selectedProductIds, heroProductId]);

  const selectedScenes = useMemo(
    () => bundleScenes.filter(s => selectedSceneIds.has(s.id)),
    [bundleScenes, selectedSceneIds]
  );

  const totalImages = selectedScenes.length * selectedRatios.length;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;
  const canAfford = balance >= totalCredits;

  const handleToggleProduct = useCallback((id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_PRODUCTS) next.add(id);
      return next;
    });
  }, []);

  const handleToggleScene = useCallback((sceneId: string) => {
    setSelectedSceneIds(prev => {
      const next = new Set(prev);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      return next;
    });
  }, []);

  const toggleRatio = useCallback((ratio: string) => {
    setSelectedRatios(prev => {
      if (prev.includes(ratio)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(r => r !== ratio);
      }
      return [...prev, ratio];
    });
  }, []);

  // ── Generation ──
  const handleGenerate = useCallback(async () => {
    if (!canAfford) { setNoCreditsModalOpen(true); return; }
    if (selectedProducts.length < MIN_PRODUCTS) {
      toast.error(`Select at least ${MIN_PRODUCTS} products`);
      return;
    }
    if (selectedScenes.length === 0) {
      toast.error('Select at least one scene');
      return;
    }

    if (pollingRef.current) { clearTimeout(pollingRef.current); pollingRef.current = null; }
    setJobMap(new Map());
    setExpectedJobCount(totalImages);
    setEnqueuedCount(0);
    setCompletedJobs(0);
    setStep(5);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { toast.error('Authentication required'); setStep(4); return; }

    // Convert all product images to base64
    const productBase64Map = new Map<string, string>();
    for (const p of selectedProducts) {
      productBase64Map.set(p.id, await convertImageToBase64(p.image_url));
    }

    const heroProduct = selectedProducts.find(p => p.id === heroProductId) || selectedProducts[0];
    const otherProducts = selectedProducts.filter(p => p.id !== heroProduct.id);

    const batchId = crypto.randomUUID();
    const newJobMap = new Map<string, string>();
    let lastBalance: number | null = null;
    const WORKFLOW_ID = '4bb79966-42f1-4720-af45-183aa954e8e1';

    // Build all jobs
    interface JobDescriptor {
      key: string;
      payload: Record<string, unknown>;
    }
    const allJobs: JobDescriptor[] = [];

    for (const scene of selectedScenes) {
      // Build bundle products for prompt
      const bundleProducts: BundleProduct[] = selectedProducts.map(p => ({
        title: p.title,
        productType: analyses[p.id]?.category || p.product_type,
        description: p.description || undefined,
        category: analyses[p.id]?.category || p.product_type,
        dimensions: p.dimensions || undefined,
        analysis: analyses[p.id] || null,
        isHero: p.id === heroProduct.id,
      }));

      const promptInstruction = buildBundlePrompt({
        products: bundleProducts,
        scene,
        arrangement,
        customNote: customNote || undefined,
      });

      const additionalProducts = otherProducts.map(p => ({
        title: p.title,
        productType: analyses[p.id]?.category || p.product_type,
        description: p.description || '',
        imageUrl: productBase64Map.get(p.id) || '',
      }));

      for (const ratio of selectedRatios) {
        const variationEntry = {
          label: scene.title + (selectedRatios.length > 1 ? ` [${ratio}]` : ''),
          instruction: promptInstruction,
          aspect_ratio: ratio,
          ...(scene.useSceneReference && scene.previewUrl ? {
            use_scene_reference: true,
            preview_url: scene.previewUrl,
          } : {}),
        };

        const payload: Record<string, unknown> = {
          workflow_id: WORKFLOW_ID,
          workflow_name: 'Bundle Visuals',
          workflow_slug: 'bundle-visuals',
          product: {
            title: heroProduct.title,
            productType: analyses[heroProduct.id]?.category || heroProduct.product_type,
            description: heroProduct.description,
            dimensions: heroProduct.dimensions || undefined,
            imageUrl: productBase64Map.get(heroProduct.id) || '',
            analysis: analyses[heroProduct.id] || undefined,
          },
          product_name: `Bundle: ${selectedProducts.map(p => p.title).join(', ')}`,
          product_image_url: heroProduct.image_url,
          extra_variations: [variationEntry],
          selected_variations: [0],
          additional_products: additionalProducts,
          quality: 'high',
          aspectRatio: ratio,
          batch_id: batchId,
          scene_name: scene.title,
          scene_id: scene.id,
          batch_size: totalImages,
        };

        const key = `bundle_${scene.id}_r${ratio}`;
        allJobs.push({ key, payload });
      }
    }

    // Send in parallel chunks
    const CONCURRENCY = 4;
    let aborted = false;
    for (let chunkStart = 0; chunkStart < allJobs.length && !aborted; chunkStart += CONCURRENCY) {
      const chunk = allJobs.slice(chunkStart, chunkStart + CONCURRENCY);
      if (chunkStart > 0) await paceDelay(1);

      const results = await Promise.allSettled(
        chunk.map(job =>
          enqueueWithRetry(
            { jobType: 'workflow', payload: job.payload, imageCount: 1, quality: 'high', hasModel: false, hasScene: false, skipWake: true },
            token,
          ).then(result => ({ ...job, result }))
        )
      );

      for (const settled of results) {
        if (settled.status !== 'fulfilled') continue;
        const { key, result } = settled.value;
        if (!isEnqueueError(result)) {
          newJobMap.set(key, result.jobId);
          lastBalance = result.newBalance;
          injectActiveJob(queryClient, {
            jobId: result.jobId,
            workflow_name: 'Bundle Visuals',
            workflow_slug: 'bundle-visuals',
            product_name: `Bundle (${selectedProducts.length} products)`,
            job_type: 'workflow',
            quality: 'high',
            imageCount: 1,
            batch_id: batchId,
          });
        } else if (result.type === 'insufficient_credits') {
          toast.error(result.message);
          aborted = true;
        }
      }
      setJobMap(new Map(newJobMap));
      setEnqueuedCount(newJobMap.size);
    }

    if (newJobMap.size === 0) {
      toast.error('Could not queue any jobs');
      setStep(4);
      return;
    }

    if (lastBalance !== null) setBalanceFromServer(lastBalance);
    setJobMap(new Map(newJobMap));
    setEnqueuedCount(newJobMap.size);
    setExpectedJobCount(newJobMap.size);
    sendWake(token);

    // Start polling
    const jobIds = Array.from(newJobMap.values());
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
          const failedCount = done.filter(j => j.status === 'failed').length;
          if (failedCount > 0) toast.warning(`${failedCount} image${failedCount !== 1 ? 's' : ''} failed — credits refunded`);
          toast.success(`Bundle visuals complete — ${done.length - failedCount} images ready`);
          navigate('/app/library');
          return;
        }
        pollingRef.current = setTimeout(poll, 3000);
      } catch {
        pollingRef.current = setTimeout(poll, 5000);
      }
    };
    pollingRef.current = setTimeout(poll, 2000);
  }, [selectedProducts, selectedScenes, canAfford, heroProductId, arrangement, customNote, selectedRatios, totalImages, analyses, setBalanceFromServer, queryClient, navigate]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearTimeout(pollingRef.current); };
  }, []);

  const canNavigateTo = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return selectedProductIds.size >= MIN_PRODUCTS;
    if (s === 3) return selectedProductIds.size >= MIN_PRODUCTS && selectedSceneIds.size > 0;
    if (s === 4) return selectedProductIds.size >= MIN_PRODUCTS && selectedSceneIds.size > 0;
    return false;
  };

  const canProceed = (() => {
    switch (step) {
      case 1: return selectedProductIds.size >= MIN_PRODUCTS;
      case 2: return selectedSceneIds.size > 0;
      case 3: return true;
      case 4: return canAfford && totalImages > 0 && selectedRatios.length > 0;
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
    <div className="space-y-6 pb-36 overflow-x-clip max-w-full min-w-0">
      <SEOHead title="Bundle Visuals — VOVV" description="Generate multi-product bundle visuals for e-commerce" />
      <PageHeader title="Bundle Visuals" subtitle="Create stunning multi-product compositions for gift sets, kits, and collections"><span /></PageHeader>

      {step <= 4 && (
        <CatalogStepper
          steps={STEP_DEFS}
          currentStep={step}
          canNavigateTo={canNavigateTo}
          onStepClick={(s) => setStep(s as BundleStep)}
        />
      )}

      <div className="mt-2">
        {/* Step 1: Product Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Select <strong>2-5 products</strong> to compose into a single bundle image. The <Star className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" /> hero product will be most prominent
              </p>
            </div>
            <BundleProductPicker
              products={userProducts}
              selectedIds={selectedProductIds}
              heroId={heroProductId}
              onToggle={handleToggleProduct}
              onSetHero={setHeroProductId}
              isLoading={isLoadingProducts}
              maxProducts={MAX_PRODUCTS}
            />
          </div>
        )}

        {/* Step 2: Scene Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <Badge variant="secondary">{selectedSceneIds.size} shot{selectedSceneIds.size !== 1 ? 's' : ''} selected</Badge>
            </div>
            {isLoadingScenes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : bundleScenes.length === 0 ? (
              <div className="flex flex-col items-center py-16 space-y-3">
                <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Bundle scenes are being prepared — check back soon</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bundleScenes.map(scene => {
                  const isSelected = selectedSceneIds.has(scene.id);
                  return (
                    <button
                      key={scene.id}
                      onClick={() => handleToggleScene(scene.id)}
                      className={cn(
                        'group relative rounded-xl overflow-hidden border-2 transition-all text-left',
                        isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-muted-foreground/40'
                      )}
                    >
                      <div className="aspect-[4/3] relative bg-muted flex items-center justify-center">
                        {scene.previewUrl ? (
                          <ShimmerImage
                            src={getOptimizedUrl(scene.previewUrl, { quality: 60 })}
                            alt={scene.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-8 h-8 text-muted-foreground/30" />
                        )}
                        {isSelected && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium">{scene.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{scene.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Setup */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl">
            {/* Arrangement Style */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Arrangement Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ARRANGEMENT_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setArrangement(opt.value)}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left',
                        arrangement === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
                      )}
                    >
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Aspect Ratio</h3>
              <div className="flex gap-2 flex-wrap">
                {['1:1', '4:5', '16:9', '9:16'].map(r => (
                  <button
                    key={r}
                    onClick={() => toggleRatio(r)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border-2 transition-all',
                      selectedRatios.includes(r) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Note */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Custom Direction <span className="text-muted-foreground font-normal">(optional)</span></h3>
              <Textarea
                placeholder="e.g. 'Valentine's Day gift set vibe' or 'Use warm tones, focus on the perfume bottle'"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {step === 4 && (
          <div className="space-y-6 max-w-2xl">
            <div className="border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold">Bundle Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Products</div>
                <div className="font-medium">{selectedProducts.length} products</div>
                <div className="text-muted-foreground">Hero Product</div>
                <div className="font-medium">{selectedProducts.find(p => p.id === heroProductId)?.title || '—'}</div>
                <div className="text-muted-foreground">Scenes</div>
                <div className="font-medium">{selectedScenes.length} scene{selectedScenes.length !== 1 ? 's' : ''}</div>
                <div className="text-muted-foreground">Arrangement</div>
                <div className="font-medium capitalize">{arrangement}</div>
                <div className="text-muted-foreground">Ratios</div>
                <div className="font-medium">{selectedRatios.join(', ')}</div>
                <div className="text-muted-foreground">Total Images</div>
                <div className="font-medium">{totalImages}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold">Total Credits</span>
                <Badge variant={canAfford ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                  {totalCredits} credits
                </Badge>
              </div>
              {!canAfford && (
                <p className="text-xs text-destructive">Not enough credits. You have {balance} credits, need {totalCredits}.</p>
              )}
            </div>

            {/* Product preview strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {selectedProducts.map(p => (
                <div key={p.id} className={cn(
                  'flex-shrink-0 w-16 rounded-lg overflow-hidden border-2',
                  p.id === heroProductId ? 'border-amber-400' : 'border-border'
                )}>
                  <div className="aspect-square bg-muted">
                    <ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 40 })} alt={p.title} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[9px] text-center truncate px-1 py-0.5">{p.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Generating */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Creating your bundle visuals</p>
              <p className="text-sm text-muted-foreground">
                {completedJobs}/{expectedJobCount} images complete
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {step <= 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>Back</Button>
            <Button onClick={handleNext} disabled={!canProceed} className="min-w-[120px]">
              {step === 4 ? `Generate (${totalCredits} credits)` : 'Next'}
            </Button>
          </div>
        </div>
      )}

      <NoCreditsModal open={noCreditsModalOpen} onClose={() => setNoCreditsModalOpen(false)} />
    </div>
  );
}
