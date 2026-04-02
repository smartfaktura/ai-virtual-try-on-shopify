import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useCredits } from '@/contexts/CreditContext';
import { useCatalogGenerate } from '@/hooks/useCatalogGenerate';
import { detectProductCategory } from '@/lib/catalogEngine';
import { PageHeader } from '@/components/app/PageHeader';
import { AddProductModal } from '@/components/app/AddProductModal';
import { CatalogStepper } from '@/components/app/catalog/CatalogStepper';
import { CatalogContextSidebar } from '@/components/app/catalog/CatalogContextSidebar';
import { CatalogTeamStrip } from '@/components/app/catalog/CatalogTeamStrip';
import { CatalogStepProducts } from '@/components/app/catalog/CatalogStepProducts';
import { CatalogStepFashionStyle } from '@/components/app/catalog/CatalogStepFashionStyle';
import { CatalogStepModelsV2 } from '@/components/app/catalog/CatalogStepModelsV2';
import { CatalogStepBackgroundsV2 } from '@/components/app/catalog/CatalogStepBackgroundsV2';
import { CatalogStepShots } from '@/components/app/catalog/CatalogStepShots';
import { CatalogStepProps } from '@/components/app/catalog/CatalogStepProps';
import { CatalogStepReviewV2 } from '@/components/app/catalog/CatalogStepReviewV2';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockModels } from '@/data/mockData';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { downloadDropAsZip } from '@/lib/dropDownload';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, Palette, Users, Image, Camera, Gem, ClipboardCheck, Check, CheckCircle, RefreshCw, ArrowRight, AlertTriangle, Loader2, Clock, Download, LayoutList } from 'lucide-react';
import type { Product, ModelProfile } from '@/types';
import type { FashionStyleId, CatalogShotId, ProductCategory, CatalogSessionConfig, CatalogModelEntry, ModelAudienceType } from '@/types/catalog';

const CATALOG_MAX_PRODUCTS = 50;
const CREDITS_PER_IMAGE = 4;

const STEPS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Style', icon: Palette },
  { number: 3, label: 'Models', icon: Users },
  { number: 4, label: 'Background', icon: Image },
  { number: 5, label: 'Shots', icon: Camera },
  { number: 6, label: 'Props', icon: Gem },
  { number: 7, label: 'Review', icon: ClipboardCheck },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CatalogGenerate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { balance, refreshBalance, openBuyModal } = useCredits();
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Step 2
  const [fashionStyle, setFashionStyle] = useState<FashionStyleId | null>(null);

  // Step 3 — multi-model
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [productOnlyMode, setProductOnlyMode] = useState(false);
  const [modelExplicitlyChosen, setModelExplicitlyChosen] = useState(false);

  // Step 4
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null);

  // Step 5
  const [selectedShots, setSelectedShots] = useState<Set<CatalogShotId>>(new Set());

  // Step 6 — per-combo prop assignments
  const [propAssignments, setPropAssignments] = useState<Record<string, string[]>>({});

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Elapsed time tracking
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generation
  const { startGeneration, batchState, isGenerating, resetBatch } = useCatalogGenerate();

  const [teamIndex, setTeamIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const generationStartedAtRef = useRef<number | null>(null);
  const allDone = batchState?.allDone ?? false;
  const hasBatch = !!batchState;

  // Rotating team avatar
  useEffect(() => {
    if (!hasBatch || allDone) return;
    const iv = setInterval(() => setTeamIndex(i => (i + 1) % TEAM_MEMBERS.length), 4000);
    return () => clearInterval(iv);
  }, [hasBatch, allDone]);

  // Keep ref in sync
  useEffect(() => { generationStartedAtRef.current = generationStartedAt; }, [generationStartedAt]);

  // Timer effect
  useEffect(() => {
    if (hasBatch && !allDone && generationStartedAtRef.current) {
      timerRef.current = setInterval(() => {
        if (generationStartedAtRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - generationStartedAtRef.current) / 1000));
        }
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    if (allDone && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [allDone, hasBatch]);

  // Fetch products
  const { data: userProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('id, title, image_url, product_type, tags, description, product_images(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const products: Product[] = useMemo(() => userProducts.map((p: any) => ({
    id: p.id, title: p.title, vendor: p.product_type || '', productType: p.product_type || '',
    images: [{ url: p.image_url }, ...(p.product_images || []).sort((a: any, b: any) => a.position - b.position).map((img: any) => ({ url: img.image_url }))],
    tags: p.tags || [], description: p.description || '', status: 'active' as const, createdAt: p.created_at || '', updatedAt: p.updated_at || '',
  })), [userProducts]);

  // Models
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const libraryModels = useMemo(() => [...mockModels, ...customModels.filter(m => !mockModels.some(mm => mm.modelId === m.modelId))], [customModels]);
  const allModels = useMemo(() => [...libraryModels, ...userModelProfiles], [libraryModels, userModelProfiles]);

  // Detect primary category
  const primaryCategory: ProductCategory = useMemo(() => {
    const firstId = Array.from(selectedProductIds)[0];
    const p = products.find(pr => pr.id === firstId);
    if (!p) return 'unknown';
    return detectProductCategory(p.title, p.productType, p.description);
  }, [selectedProductIds, products]);

  const hasModel = selectedModelIds.size > 0 && !productOnlyMode;
  const modelCount = productOnlyMode ? 0 : selectedModelIds.size;

  // Credits
  const totalImages = selectedProductIds.size * Math.max(1, modelCount) * selectedShots.size;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;

  const handleModelToggle = (id: string) => {
    setModelExplicitlyChosen(true);
    setProductOnlyMode(false);
    setSelectedModelIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSelectedShots(new Set());
  };

  const handleProductOnlyToggle = () => {
    setModelExplicitlyChosen(true);
    setProductOnlyMode(true);
    setSelectedModelIds(new Set());
    setSelectedShots(new Set());
  };

  const handleShotToggle = (id: CatalogShotId) => {
    setSelectedShots(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handlePreselectRecommended = (ids: CatalogShotId[]) => {
    setSelectedShots(new Set(ids));
  };

  // Step validation
  const canStep1 = selectedProductIds.size >= 1;
  const canStep2 = fashionStyle !== null;
  const canStep3 = modelExplicitlyChosen;
  const canStep4 = selectedBackgroundId !== null;
  const canStep5 = selectedShots.size >= 1;
  const canStep6 = canStep5; // props step is always passable (optional)
  const canStep7 = canStep6;

  const canNavigateTo = (s: number) => {
    if (s <= step) return true;
    if (s === 2) return canStep1;
    if (s === 3) return canStep1 && canStep2;
    if (s === 4) return canStep1 && canStep2 && canStep3;
    if (s === 5) return canStep1 && canStep2 && canStep3 && canStep4;
    if (s === 6) return canStep1 && canStep2 && canStep3 && canStep4 && canStep5;
    if (s === 7) return canStep1 && canStep2 && canStep3 && canStep4 && canStep5;
    return false;
  };

  const inferAudience = (m: ModelProfile): ModelAudienceType => {
    if (m.ageRange === 'young-adult' && m.gender === 'female') return 'adult_woman';
    if (m.gender === 'male') return 'adult_man';
    return 'adult_woman';
  };

  const handleGenerate = async () => {
    if (!fashionStyle || !selectedBackgroundId) return;

    setGenerationStartedAt(Date.now());
    setElapsedSeconds(0);

    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));

    const models: CatalogModelEntry[] = productOnlyMode
      ? []
      : Array.from(selectedModelIds).map(id => {
          const m = allModels.find(mod => mod.modelId === id)!;
          return {
            id: m.modelId,
            profile: `${m.name}, ${m.ethnicity || ''} ${m.ageRange} ${m.gender} model, ${m.bodyType || 'average'} build`.replace(/\s+/g, ' ').trim(),
            audience: inferAudience(m),
            imageUrl: m.sourceImageUrl || m.previewUrl || null,
          };
        }).filter(Boolean);

    const config: CatalogSessionConfig = {
      products: selectedProducts.map(p => ({
        id: p.id, title: p.title, description: p.description,
        productType: p.productType, imageUrl: p.images[0]?.url || '',
        detectedCategory: detectProductCategory(p.title, p.productType, p.description),
      })),
      fashionStyle,
      models,
      backgroundId: selectedBackgroundId,
      selectedShots: Array.from(selectedShots),
      propAssignments: Object.fromEntries(
        Object.entries(propAssignments)
          .filter(([, ids]) => ids.length > 0)
          .map(([key, ids]) => [
            key,
            ids.map(id => {
              const p = products.find(pr => pr.id === id);
              return p ? { id: p.id, title: p.title, imageUrl: p.images[0]?.url || '' } : null;
            }).filter(Boolean),
          ]),
      ),
    };

    await startGeneration(config);
    refreshBalance();
  };

  const handleNewGeneration = () => {
    resetBatch();
    navigate('/app/catalog');
  };

  // Estimated time remaining
  const estimatedRemaining = useMemo(() => {
    if (!batchState || batchState.completedJobs === 0) return null;
    const avgTime = elapsedSeconds / batchState.completedJobs;
    const remaining = batchState.totalJobs - batchState.completedJobs - batchState.failedJobs;
    return Math.ceil(avgTime * remaining);
  }, [batchState, elapsedSeconds]);

  // Sidebar data
  const sidebarProducts = useMemo(() => 
    userProducts.filter(p => selectedProductIds.has(p.id)).map(p => ({ id: p.id, title: p.title, image_url: p.image_url })),
    [userProducts, selectedProductIds]
  );
  const sidebarModels = useMemo(() => 
    allModels.filter(m => selectedModelIds.has(m.modelId)).map(m => ({ modelId: m.modelId, name: m.name, previewUrl: m.previewUrl })),
    [allModels, selectedModelIds]
  );

  // Show preparing state
  if (isGenerating && !batchState) {
    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Catalog Studio" subtitle="Your AI-powered product photoshoot" backAction={{ content: 'Back', onAction: () => navigate('/app/catalog') }}><div /></PageHeader>
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          {/* Animated gradient ring */}
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-full opacity-60 blur-sm"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))',
                animation: 'spin 3s linear infinite',
              }}
            />
            <div className="relative w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          </div>
          {/* Phase badge */}
          <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-medium gap-1.5 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Preparing
          </Badge>
          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight">Setting up your photoshoot</h2>
            <p className="text-sm text-muted-foreground">Queuing images and preparing consistency references…</p>
          </div>
          {/* Pulsing dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase font-light">VOVV.AI Studio</p>
        </div>
      </div>
    );
  }

  // If batch is active, show progress / completion
  if (batchState) {
    // Filter: only show user-visible jobs (not anchors, not placeholders)
    const visibleJobs = batchState.jobs.filter(j => j.isUserVisible !== false && j.shotId !== 'identity_anchor' && !j.isPlaceholder);
    const visibleCompleted = visibleJobs.filter(j => j.status === 'completed').length;
    const visibleFailed = visibleJobs.filter(j => j.status === 'failed').length;
    const visibleTotal = Math.max(visibleJobs.length, batchState.totalJobs);
    const progress = visibleTotal > 0
      ? Math.round(((visibleCompleted + visibleFailed) / visibleTotal) * 100) : 0;
    const isAnchoring = batchState.phase === 'anchors';
    const allVisibleFailed = visibleJobs.length > 0 && visibleFailed === visibleJobs.length;

    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Catalog Studio" subtitle="Your AI-powered product photoshoot" backAction={{ content: 'Back', onAction: () => navigate('/app/catalog') }}><div /></PageHeader>

        {batchState.allDone ? (
          <div className="space-y-6">
            <div className="relative rounded-2xl border border-border bg-card p-8 text-center space-y-5 overflow-hidden">
              {/* Subtle gradient wash behind success */}
              {!allVisibleFailed && visibleCompleted > 0 && (
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
              )}
              <div className="relative space-y-5">
                {allVisibleFailed ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Generation Failed</h2>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        All {visibleFailed} image{visibleFailed !== 1 ? 's' : ''} failed. Credits have been refunded.
                      </p>
                    </div>
                  </>
                ) : visibleCompleted === 0 ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">No Images Generated</h2>
                      <p className="text-sm text-muted-foreground mt-1.5">Something went wrong. Please try again.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-scale-in">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Your Catalog is Ready</h2>
                    </div>
                  </>
                )}
                {/* Metric chips */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {visibleCompleted > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                      <Image className="w-3 h-3 text-primary" /> {visibleCompleted} image{visibleCompleted !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="w-3 h-3" /> {formatTime(elapsedSeconds)}
                  </span>
                  {visibleFailed > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/5 border border-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                      <AlertTriangle className="w-3 h-3" /> {visibleFailed} failed
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase font-light">VOVV.AI Studio</p>
                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                  <Button variant="outline" onClick={handleNewGeneration} className="gap-2 text-sm rounded-full">
                    <RefreshCw className="w-3.5 h-3.5" /> New Set
                  </Button>
                  {batchState.aggregatedImages.length > 1 && (
                    <Button variant="outline" disabled={isDownloading} onClick={async () => {
                      setIsDownloading(true);
                      try {
                        const images = visibleJobs
                          .filter(j => j.status === 'completed' && j.images.length > 0)
                          .flatMap(j => j.images.map(url => ({
                            url,
                            workflow_name: j.productName || 'Catalog',
                            scene_name: j.shotLabel || 'image',
                            product_title: j.productName,
                          })));
                        await downloadDropAsZip(images, 'Catalog-Export');
                      } finally {
                        setIsDownloading(false);
                      }
                    }} className="gap-2 text-sm rounded-full">
                      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {isDownloading ? 'Preparing...' : 'Download All'}
                    </Button>
                  )}
                  <Button onClick={() => navigate('/app/library')} className="gap-2 text-sm rounded-full">
                    View in Library <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {(() => {
              const visibleImages = visibleJobs.filter(j => j.status === 'completed' && j.images.length > 0);
              if (visibleImages.length === 0) return null;
              const imageJobMap = visibleImages.flatMap(j =>
                j.images.map(img => ({ url: img, shotLabel: j.shotLabel, productName: j.productName }))
              );
              return (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated Images</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {imageJobMap.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/40 hover:scale-[1.03] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 animate-fade-in"
                      >
                        <ShimmerImage src={item.url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        {item.shotLabel && (
                          <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] leading-tight font-medium backdrop-blur-md bg-black/40 text-white rounded-md px-2 py-1 truncate text-center">
                            {item.shotLabel}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {visibleFailed > 0 && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {visibleFailed} image{visibleFailed > 1 ? 's' : ''} failed
                </div>
                <p className="text-xs text-muted-foreground">Credits for failed images are automatically refunded.</p>
                <ul role="list" className="space-y-1">
                  {visibleJobs.filter(j => j.status === 'failed').map(j => (
                    <li key={j.jobId} className="text-xs text-destructive/80 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-destructive/60 flex-shrink-0" />
                      {j.productName} — {j.shotLabel}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main generation card */}
            <div className="relative rounded-2xl border border-border bg-card p-8 text-center space-y-5 overflow-hidden">
              {/* Subtle gradient wash */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

              <div className="relative space-y-5">
                {/* Phase badge */}
                <Badge variant="secondary" className="text-[10px] tracking-widest uppercase font-medium gap-1.5 px-3 py-1 rounded-full">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAnchoring ? "bg-muted-foreground animate-pulse" : "bg-primary animate-pulse"
                  )} />
                  {isAnchoring ? 'Preparing' : 'Generating'}
                </Badge>

                {/* Animated gradient ring icon */}
                <div className="relative mx-auto w-14 h-14">
                  <div
                    className="absolute -inset-1.5 rounded-full opacity-50 blur-sm"
                    style={{
                      background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.15), hsl(var(--primary)), hsl(var(--primary) / 0.15), hsl(var(--primary)))',
                      animation: 'spin 3s linear infinite',
                    }}
                  />
                  <div className="relative w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
                    <Camera className="w-5.5 h-5.5 text-primary" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {isAnchoring ? 'Locking consistency reference…' : 'Generating your catalog'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isAnchoring
                      ? 'Preparing identity reference for consistent results'
                      : `${visibleCompleted} of ${visibleTotal} images complete`
                    }
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <Progress value={isAnchoring ? undefined : Math.max(progress, 3)} className="h-2" />
                  {!isAnchoring && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{visibleCompleted}/{visibleTotal} images</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                  )}
                </div>

                {/* Stats chips */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {formatTime(elapsedSeconds)}
                  </span>
                  {estimatedRemaining !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs text-muted-foreground">
                      ~{formatTime(estimatedRemaining)} left
                    </span>
                  )}
                </div>

                {/* Team avatar in frosted card */}
                <div className="inline-flex items-center gap-2.5 rounded-full bg-muted/60 backdrop-blur-sm border border-border/50 px-3 py-1.5 mx-auto transition-opacity duration-500">
                  <Avatar className="w-6 h-6 border border-primary/20 ring-1 ring-primary/10">
                    <AvatarImage src={TEAM_MEMBERS[teamIndex].avatar} alt={TEAM_MEMBERS[teamIndex].name} />
                    <AvatarFallback className="text-[10px]">{TEAM_MEMBERS[teamIndex].name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground italic">
                    {TEAM_MEMBERS[teamIndex].name} is {TEAM_MEMBERS[teamIndex].statusMessage.toLowerCase()}
                  </p>
                </div>

                <p className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase font-light">VOVV.AI Studio</p>

                {/* Cancel */}
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowCancelDialog(true)}>
                    Cancel
                  </Button>
                </div>
              </div>
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel generation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Already-queued images will still be processed and credits for completed images will be used. Only future batches will be stopped.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep going</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { resetBatch(); setGenerationStartedAt(null); setElapsedSeconds(0); setShowCancelDialog(false); }}>
                      Cancel generation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Product progress cards */}
            {(() => {
              const productMap = new Map<string, { name: string; imageUrl: string; total: number; done: number; failed: number }>();
              for (const j of visibleJobs) {
                const existing = productMap.get(j.productId) || { name: j.productName, imageUrl: '', total: 0, done: 0, failed: 0 };
                existing.total++;
                if (j.status === 'completed') existing.done++;
                if (j.status === 'failed') existing.failed++;
                if (!existing.imageUrl) {
                  const prod = products.find(p => p.id === j.productId);
                  if (prod?.images[0]?.url) existing.imageUrl = prod.images[0].url;
                }
                productMap.set(j.productId, existing);
              }
              return (
                <div className="space-y-2">
                  {Array.from(productMap.entries()).map(([pid, info]) => {
                    const isDone = info.done === info.total;
                    const isActive = !isDone && info.done > 0;
                    return (
                      <div
                        key={pid}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border bg-card p-3 transition-all duration-200",
                          isDone ? "border-primary/20 bg-primary/[0.02]" :
                          isActive ? "border-primary/30 shadow-sm" :
                          "border-border"
                        )}
                      >
                        {info.imageUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <ShimmerImage src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 animate-pulse" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{info.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {info.done}/{info.total} images
                            {info.failed > 0 && <span className="text-destructive"> · {info.failed} failed</span>}
                          </p>
                          <Progress value={Math.round(((info.done + info.failed) / info.total) * 100)} className="h-1 mt-1.5" />
                        </div>
                        {isDone ? (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-scale-in">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            {Math.round((info.done / info.total) * 100)}%
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Live image grid */}
            {(() => {
              const imageJobMap: { url: string; shotLabel: string }[] = [];
              for (const j of visibleJobs) {
                if (j.status !== 'completed') continue;
                for (const img of j.images) {
                  imageJobMap.push({ url: img, shotLabel: j.shotLabel });
                }
              }
              if (imageJobMap.length === 0) return null;
              return (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated so far</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {imageJobMap.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/40 hover:scale-[1.03] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 animate-fade-in"
                      >
                        <ShimmerImage src={item.url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] leading-tight font-medium backdrop-blur-md bg-black/40 text-white rounded-md px-2 py-1 truncate text-center">
                          {item.shotLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <ImageLightbox
          images={visibleJobs.flatMap(j => j.images)}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(i) => {
            const allImages = visibleJobs.flatMap(j => j.status === 'completed' ? j.images.map(url => ({ url, productName: j.productName, shotLabel: j.shotLabel })) : []);
            const item = allImages[i];
            if (!item) return;
            const safeName = (item.productName || 'product').replace(/[^a-zA-Z0-9]+/g, '-');
            const safeShot = (item.shotLabel || 'shot').replace(/[^a-zA-Z0-9]+/g, '-');
            const filename = `${safeName}_${safeShot}.jpg`;
            fetch(item.url).then(r => r.blob()).then(blob => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = filename;
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(() => window.open(item.url, '_blank'));
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 sm:pb-32">
      {/* Header with team strip */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Catalog Studio" subtitle="Generate consistent photography across your catalog" backAction={{ content: 'Back', onAction: () => navigate('/app/catalog') }}><div /></PageHeader>
        <div className="hidden md:block pt-1">
          <CatalogTeamStrip />
        </div>
      </div>

      {/* Stepper */}
      <CatalogStepper
        steps={STEPS}
        currentStep={step}
        canNavigateTo={canNavigateTo}
        onStepClick={setStep}
      />

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Step content */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <CatalogStepProducts
              products={userProducts.map(p => ({ id: p.id, title: p.title, image_url: p.image_url, product_type: p.product_type || '' }))}
              productsLoading={productsLoading}
              selectedProductIds={selectedProductIds}
              onProductSelectionChange={setSelectedProductIds}
              maxProducts={CATALOG_MAX_PRODUCTS}
              onNext={() => setStep(2)}
              canProceed={canStep1}
              onAddProduct={() => setShowAddProduct(true)}
            />
          )}

          {step === 2 && (
            <CatalogStepFashionStyle
              selectedStyle={fashionStyle}
              onStyleChange={setFashionStyle}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              canProceed={canStep2}
            />
          )}

          {step === 3 && (
            <CatalogStepModelsV2
              libraryModels={libraryModels}
              userModels={userModelProfiles}
              selectedModelIds={selectedModelIds}
              productOnlyMode={productOnlyMode}
              onModelToggle={handleModelToggle}
              onProductOnlyToggle={handleProductOnlyToggle}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              canProceed={canStep3}
            />
          )}

          {step === 4 && (
            <CatalogStepBackgroundsV2
              selectedBackgroundId={selectedBackgroundId}
              onBackgroundChange={setSelectedBackgroundId}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
              canProceed={canStep4}
            />
          )}

          {step === 5 && (
            <CatalogStepShots
              productCategory={primaryCategory}
              hasModel={hasModel}
              selectedShots={selectedShots}
              onToggleShot={handleShotToggle}
              onBack={() => setStep(4)}
              onNext={() => setStep(6)}
              canProceed={canStep5}
              totalImages={totalImages}
              totalCredits={totalCredits}
              balance={balance}
              onOpenBuyModal={openBuyModal}
              onPreselectRecommended={handlePreselectRecommended}
              productCount={selectedProductIds.size}
              modelCount={modelCount}
            />
          )}

          {step === 6 && (
            <CatalogStepProps
              allProducts={userProducts.map(p => ({ id: p.id, title: p.title, image_url: p.image_url, product_type: p.product_type || '' }))}
              heroProductIds={selectedProductIds}
              heroProducts={products.filter(p => selectedProductIds.has(p.id)).map(p => ({
                id: p.id, title: p.title, imageUrl: p.images[0]?.url || '',
              }))}
              models={allModels.filter(m => selectedModelIds.has(m.modelId)).map(m => ({
                id: m.modelId, name: m.name, previewUrl: m.previewUrl,
              }))}
              productOnlyMode={productOnlyMode}
              selectedShots={selectedShots}
              propAssignments={propAssignments}
              onPropAssignmentsChange={setPropAssignments}
              onBack={() => setStep(5)}
              onNext={() => setStep(7)}
            />
          )}

          {step === 7 && (
            <CatalogStepReviewV2
              products={products.filter(p => selectedProductIds.has(p.id))}
              models={allModels.filter(m => selectedModelIds.has(m.modelId))}
              productOnlyMode={productOnlyMode}
              fashionStyleId={fashionStyle}
              backgroundId={selectedBackgroundId}
              selectedShots={selectedShots}
              propAssignments={propAssignments}
              allProducts={userProducts.map(p => ({ id: p.id, title: p.title, image_url: p.image_url, product_type: p.product_type || '' }))}
              totalImages={totalImages}
              totalCredits={totalCredits}
              balance={balance}
              isGenerating={isGenerating}
              onBack={() => setStep(6)}
              onGenerate={handleGenerate}
              onOpenBuyModal={openBuyModal}
              onStepClick={setStep}
            />
          )}
        </div>

        {/* Context sidebar — desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <CatalogContextSidebar
            selectedProducts={sidebarProducts}
            fashionStyleId={fashionStyle}
            models={sidebarModels}
            productOnlyMode={productOnlyMode}
            backgroundId={selectedBackgroundId}
            selectedShots={selectedShots}
            selectedPropCount={Object.values(propAssignments).filter(ids => ids.length > 0).length}
            totalCombos={selectedProductIds.size * Math.max(1, modelCount) * selectedShots.size}
            totalImages={totalImages}
            totalCredits={totalCredits}
            currentStep={step}
            balance={balance}
          />
        </div>

        {/* Mobile summary drawer */}
        {isMobile && !(step === 1 && selectedProductIds.size > 0) && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="fixed bottom-24 right-4 z-40 rounded-full shadow-lg gap-1.5 text-xs lg:hidden"
              >
                <LayoutList className="w-3.5 h-3.5" />
                Summary
                {totalImages > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-0.5">{totalImages} img</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
              <div className="pt-2">
                <CatalogContextSidebar
                  selectedProducts={sidebarProducts}
                  fashionStyleId={fashionStyle}
                  models={sidebarModels}
                  productOnlyMode={productOnlyMode}
                  backgroundId={selectedBackgroundId}
                  selectedShots={selectedShots}
                  selectedPropCount={Object.values(propAssignments).filter(ids => ids.length > 0).length}
                  totalCombos={selectedProductIds.size * Math.max(1, modelCount) * selectedShots.size}
                  totalImages={totalImages}
                  totalCredits={totalCredits}
                  currentStep={step}
                  balance={balance}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <BuyCreditsModal />
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={() => setShowAddProduct(false)} />
    </div>
  );
}
