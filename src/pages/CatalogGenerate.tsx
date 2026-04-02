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
            profile: `${m.ageRange} ${m.gender} model`,
            audience: inferAudience(m),
            imageUrl: m.previewUrl || null,
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
    setStep(1);
    setSelectedProductIds(new Set());
    setFashionStyle(null);
    setSelectedModelIds(new Set());
    setProductOnlyMode(false);
    setModelExplicitlyChosen(false);
    setSelectedBackgroundId(null);
    setSelectedShots(new Set());
    setPropAssignments({});
    setGenerationStartedAt(null);
    setElapsedSeconds(0);
    setShowCancelDialog(false);
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
        <PageHeader title="Catalog Studio" subtitle="Your AI-powered product photoshoot"><div /></PageHeader>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Preparing your photoshoot...</h2>
            <p className="text-sm text-muted-foreground">Queuing images. This may take a moment.</p>
          </div>
          <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">VOVV.AI</p>
        </div>
      </div>
    );
  }

  // If batch is active, show progress / completion
  if (batchState) {
    const progress = batchState.totalJobs > 0
      ? Math.round(((batchState.completedJobs + batchState.failedJobs) / batchState.totalJobs) * 100) : 0;

    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Catalog Studio" subtitle="Your AI-powered product photoshoot"><div /></PageHeader>

        {batchState.allDone ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Your Catalog is Ready</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {batchState.completedJobs} image{batchState.completedJobs !== 1 ? 's' : ''} generated
                  {batchState.failedJobs > 0 && (
                    <span className="text-destructive"> · {batchState.failedJobs} failed</span>
                  )}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Total time: {formatTime(elapsedSeconds)}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50 tracking-widest uppercase">VOVV.AI</p>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <Button variant="outline" onClick={handleNewGeneration} className="gap-2 text-sm">
                  <RefreshCw className="w-3.5 h-3.5" /> New Set
                </Button>
                {batchState.aggregatedImages.length > 1 && (
                  <Button variant="outline" disabled={isDownloading} onClick={async () => {
                    setIsDownloading(true);
                    try {
                      const images = batchState.jobs
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
                  }} className="gap-2 text-sm">
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {isDownloading ? 'Preparing...' : 'Download All'}
                  </Button>
                )}
                <Button onClick={() => navigate('/app/library')} className="gap-2 text-sm">
                  View in Library <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {batchState.aggregatedImages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated Images</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {batchState.aggregatedImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <ShimmerImage src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {batchState.failedJobs > 0 && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {batchState.failedJobs} image{batchState.failedJobs > 1 ? 's' : ''} failed
                </div>
                <p className="text-xs text-muted-foreground">Credits for failed images are automatically refunded.</p>
                <ul role="list" className="space-y-1">
                  {batchState.jobs.filter(j => j.status === 'failed').map(j => (
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
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
              <div className="relative mx-auto w-12 h-12">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Generating your catalog...</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {batchState.completedJobs} of {batchState.totalJobs} images
                </p>
              </div>
              <Progress value={progress} className="h-1.5 max-w-md mx-auto" />
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Elapsed: {formatTime(elapsedSeconds)}</span>
                {estimatedRemaining !== null && (
                  <span className="flex items-center gap-1">~{formatTime(estimatedRemaining)} remaining</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2.5 transition-opacity duration-500">
                <Avatar className="w-7 h-7 border border-border">
                  <AvatarImage src={TEAM_MEMBERS[teamIndex].avatar} alt={TEAM_MEMBERS[teamIndex].name} />
                  <AvatarFallback className="text-[10px]">{TEAM_MEMBERS[teamIndex].name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground italic">
                  {TEAM_MEMBERS[teamIndex].name} is {TEAM_MEMBERS[teamIndex].statusMessage.toLowerCase()}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCancelDialog(true)}>
                Cancel
              </Button>
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

            {(() => {
              const productMap = new Map<string, { name: string; imageUrl: string; total: number; done: number; failed: number }>();
              for (const j of batchState.jobs) {
                const existing = productMap.get(j.productId) || { name: j.productName, imageUrl: '', total: 0, done: 0, failed: 0 };
                existing.total++;
                if (j.status === 'completed') existing.done++;
                if (j.status === 'failed') existing.failed++;
                // Try to find product image
                if (!existing.imageUrl) {
                  const prod = products.find(p => p.id === j.productId);
                  if (prod?.images[0]?.url) existing.imageUrl = prod.images[0].url;
                }
                productMap.set(j.productId, existing);
              }
              return (
                <div className="space-y-1.5">
                  {Array.from(productMap.entries()).map(([pid, info]) => (
                    <div key={pid} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      {info.imageUrl && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <ShimmerImage src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{info.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {info.done}/{info.total}
                          {info.failed > 0 && <span className="text-destructive"> · {info.failed} failed</span>}
                        </p>
                        <Progress value={Math.round(((info.done + info.failed) / info.total) * 100)} className="h-1 mt-1" />
                      </div>
                      <Badge variant={info.done === info.total ? 'default' : 'secondary'} className="text-[10px]">
                        {info.done === info.total ? 'Done' : `${Math.round((info.done / info.total) * 100)}%`}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })()}

            {batchState.aggregatedImages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated so far</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {batchState.aggregatedImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <ShimmerImage src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ImageLightbox
          images={batchState.aggregatedImages}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(i) => {
            const url = batchState.aggregatedImages[i];
            if (!url) return;
            // Find the job that produced this image for a descriptive filename
            let filename = `catalog-${i + 1}.jpg`;
            let found = false;
            let imgIdx = 0;
            for (const j of batchState.jobs) {
              if (found) break;
              if (j.status === 'completed') {
                for (const imgUrl of j.images) {
                  if (imgIdx === i) {
                    const safeName = (j.productName || 'product').replace(/[^a-zA-Z0-9]+/g, '-');
                    const safeShot = (j.shotLabel || 'shot').replace(/[^a-zA-Z0-9]+/g, '-');
                    filename = `${safeName}_${safeShot}.jpg`;
                    found = true;
                    break;
                  }
                  imgIdx++;
                }
              }
            }
            fetch(url).then(r => r.blob()).then(blob => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = filename;
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(() => window.open(url, '_blank'));
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 sm:pb-32">
      {/* Header with team strip */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Catalog Studio" subtitle="Generate consistent photography across your catalog"><div /></PageHeader>
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
