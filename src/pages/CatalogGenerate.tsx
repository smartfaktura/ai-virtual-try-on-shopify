import { useState, useMemo } from 'react';
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
import { CatalogStepProducts } from '@/components/app/catalog/CatalogStepProducts';
import { CatalogStepFashionStyle } from '@/components/app/catalog/CatalogStepFashionStyle';
import { CatalogStepModelsV2 } from '@/components/app/catalog/CatalogStepModelsV2';
import { CatalogStepBackgroundsV2 } from '@/components/app/catalog/CatalogStepBackgroundsV2';
import { CatalogStepShots } from '@/components/app/catalog/CatalogStepShots';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { Progress } from '@/components/ui/progress';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Package, Palette, Users, Image, Camera, Check, CheckCircle, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import type { Product, ModelProfile } from '@/types';
import type { FashionStyleId, CatalogShotId, ProductCategory, CatalogSessionConfig, CatalogModelEntry, ModelAudienceType } from '@/types/catalog';

const CATALOG_MAX_PRODUCTS = 50;
const CREDITS_PER_IMAGE = 4;

const STEPS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Style', icon: Palette },
  { number: 3, label: 'Model', icon: Users },
  { number: 4, label: 'Background', icon: Image },
  { number: 5, label: 'Shots', icon: Camera },
];

export default function CatalogGenerate() {
  const { user } = useAuth();
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

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Generation
  const { startGeneration, batchState, isGenerating, resetBatch } = useCatalogGenerate();

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

  // Detect primary category from first selected product
  const primaryCategory: ProductCategory = useMemo(() => {
    const firstId = Array.from(selectedProductIds)[0];
    const p = products.find(pr => pr.id === firstId);
    if (!p) return 'unknown';
    return detectProductCategory(p.title, p.productType, p.description);
  }, [selectedProductIds, products]);

  const hasModel = selectedModelIds.size > 0 && !productOnlyMode;
  const modelCount = productOnlyMode ? 0 : selectedModelIds.size;

  // Credits — Products × max(1, Models) × Shots × 4
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

  const canNavigateTo = (s: number) => {
    if (s <= step) return true;
    if (s === 2) return canStep1;
    if (s === 3) return canStep1 && canStep2;
    if (s === 4) return canStep1 && canStep2 && canStep3;
    if (s === 5) return canStep1 && canStep2 && canStep3 && canStep4;
    return false;
  };

  const inferAudience = (m: ModelProfile): ModelAudienceType => {
    if (m.ageRange === 'young-adult' && m.gender === 'female') return 'adult_woman';
    if (m.gender === 'male') return 'adult_man';
    return 'adult_woman';
  };

  const handleGenerate = async () => {
    if (!fashionStyle || !selectedBackgroundId) return;

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
  };

  // If batch is active, show progress / completion
  if (batchState) {
    const progress = batchState.totalJobs > 0
      ? Math.round(((batchState.completedJobs + batchState.failedJobs) / batchState.totalJobs) * 100) : 0;

    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Catalog Studio" subtitle="Your AI-powered product photoshoot"><div /></PageHeader>

        {batchState.allDone ? (
          /* ── Completion State ── */
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Your Catalog is Ready</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {batchState.completedJobs} image{batchState.completedJobs !== 1 ? 's' : ''} generated successfully
                  {batchState.failedJobs > 0 && (
                    <span className="text-destructive"> · {batchState.failedJobs} failed (credits refunded)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={handleNewGeneration} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Generate Another Set
                </Button>
                <Button onClick={() => window.location.href = '/app/library'} className="gap-2">
                  View in Library <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {batchState.aggregatedImages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Generated Images</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {batchState.aggregatedImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all"
                    >
                      <ShimmerImage src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {batchState.failedJobs > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {batchState.failedJobs} image{batchState.failedJobs > 1 ? 's' : ''} failed to generate
                </div>
                <p className="text-xs text-muted-foreground">
                  Credits for failed images are automatically refunded to your balance.
                </p>
                {batchState.jobs.filter(j => j.status === 'failed').map(j => (
                  <div key={j.jobId} className="text-xs text-destructive/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 flex-shrink-0" />
                    {j.productName} — {j.shotLabel}: {j.error || 'Generation failed'}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── In-Progress State ── */
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-transparent p-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  VOVV.AI is generating your catalog...
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {batchState.completedJobs} of {batchState.totalJobs} images complete
                </p>
              </div>
              <Progress value={progress} className="h-2 max-w-md mx-auto" />
            </div>

            {(() => {
              const productMap = new Map<string, { name: string; total: number; done: number; failed: number }>();
              for (const j of batchState.jobs) {
                const existing = productMap.get(j.productId) || { name: j.productName, total: 0, done: 0, failed: 0 };
                existing.total++;
                if (j.status === 'completed') existing.done++;
                if (j.status === 'failed') existing.failed++;
                productMap.set(j.productId, existing);
              }
              return (
                <div className="space-y-2">
                  {Array.from(productMap.entries()).map(([pid, info]) => (
                    <div key={pid} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{info.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {info.done}/{info.total} complete
                          {info.failed > 0 && <span className="text-destructive"> · {info.failed} failed</span>}
                        </p>
                      </div>
                      <Badge variant={info.done === info.total ? 'default' : 'secondary'} className="text-[10px]">
                        {info.done === info.total ? 'Done' : 'In progress'}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })()}

            {batchState.aggregatedImages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Generated so far</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {batchState.aggregatedImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all"
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
            if (url) window.open(url, '_blank');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <PageHeader title="Catalog Studio" subtitle="Generate consistent product photography across your entire catalog"><div /></PageHeader>

      {/* Horizontal numbered stepper */}
      <div className="flex items-center justify-center gap-0 py-4">
        {STEPS.map((s, i) => {
          const isActive = step === s.number;
          const isDone = step > s.number;
          const canClick = canNavigateTo(s.number);
          return (
            <div key={s.number} className="flex items-center">
              <button
                onClick={() => canClick && setStep(s.number)}
                disabled={!canClick}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2',
                  isActive && 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25',
                  isDone && !isActive && 'bg-primary/10 text-primary border-primary/30 cursor-pointer',
                  !isActive && !isDone && canClick && 'bg-card text-muted-foreground border-border cursor-pointer hover:border-primary/40',
                  !isActive && !isDone && !canClick && 'bg-muted text-muted-foreground/40 border-border/50',
                )}>
                  {isDone ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <span className={cn(
                  'text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : isDone ? 'text-primary/70' : 'text-muted-foreground',
                )}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'w-12 sm:w-20 h-0.5 rounded-full mx-1 -mt-5',
                  isDone ? 'bg-primary/40' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
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
          onGenerate={handleGenerate}
          canGenerate={canStep5 && balance >= totalCredits}
          isGenerating={isGenerating}
          totalImages={totalImages}
          totalCredits={totalCredits}
          balance={balance}
          onOpenBuyModal={openBuyModal}
          onPreselectRecommended={handlePreselectRecommended}
          productCount={selectedProductIds.size}
          modelCount={modelCount}
        />
      )}

      <BuyCreditsModal />
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={() => setShowAddProduct(false)} />
    </div>
  );
}
