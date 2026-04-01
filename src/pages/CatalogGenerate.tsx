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
import { Progress } from '@/components/ui/progress';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Package, Palette, Users, Image, Camera, Check, Loader2, CheckCircle } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';
import type { FashionStyleId, CatalogShotId, ProductCategory, CatalogSessionConfig, ModelAudienceType } from '@/types/catalog';

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

  // Step 3
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelExplicitlyChosen, setModelExplicitlyChosen] = useState(false);
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  // Step 4
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null);

  // Step 5
  const [selectedShots, setSelectedShots] = useState<Set<CatalogShotId>>(new Set());

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

  const hasModel = selectedModelId !== null;

  // Credits
  const totalImages = selectedProductIds.size * selectedShots.size;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;

  const handleModelSelect = (id: string | null) => {
    setSelectedModelId(id);
    setModelExplicitlyChosen(true);
    // Reset shots when model changes since compatibility changes
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

  const handleGenerate = async () => {
    if (!fashionStyle || !selectedBackgroundId) return;

    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const model = selectedModelId ? allModels.find(m => m.modelId === selectedModelId) : null;

    const inferAudience = (m: ModelProfile | null): ModelAudienceType => {
      if (!m) return 'adult_woman';
      if (m.ageRange === 'young-adult' && m.gender === 'female') return 'adult_woman';
      if (m.gender === 'male') return 'adult_man';
      return 'adult_woman';
    };

    const config: CatalogSessionConfig = {
      products: selectedProducts.map(p => ({
        id: p.id, title: p.title, description: p.description,
        productType: p.productType, imageUrl: p.images[0]?.url || '',
        detectedCategory: detectProductCategory(p.title, p.productType, p.description),
      })),
      fashionStyle,
      modelId: selectedModelId,
      modelProfile: model ? `${model.ageRange} ${model.gender} model` : 'no model',
      modelAudience: inferAudience(model),
      modelImageUrl: model?.previewUrl || null,
      backgroundId: selectedBackgroundId,
      selectedShots: Array.from(selectedShots),
    };

    await startGeneration(config);
    refreshBalance();
  };

  // If batch is active, show progress
  if (batchState) {
    const progress = batchState.totalJobs > 0
      ? Math.round(((batchState.completedJobs + batchState.failedJobs) / batchState.totalJobs) * 100) : 0;

    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Catalog Shot Set" subtitle="Generating your consistent catalog set"><div /></PageHeader>
        <div className="text-center space-y-3 py-8">
          {batchState.allDone ? (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-xl font-bold">Catalog Complete!</h2>
              <p className="text-muted-foreground">
                {batchState.completedJobs} of {batchState.totalJobs} images generated
                {batchState.failedJobs > 0 && ` (${batchState.failedJobs} failed)`}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Phase: {batchState.phase}</Badge>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <h2 className="text-xl font-bold">
                {batchState.phase === 'anchors' ? 'Creating Anchor Images...' : 'Generating Derivative Shots...'}
              </h2>
              <p className="text-muted-foreground">{batchState.completedJobs} of {batchState.totalJobs} complete</p>
            </>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        {batchState.aggregatedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Generated Images</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {batchState.aggregatedImages.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <ShimmerImage src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                </div>
              ))}
            </div>
          </div>
        )}
        {batchState.failedJobs > 0 && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              {batchState.failedJobs} image{batchState.failedJobs > 1 ? 's' : ''} failed. Credits refunded automatically.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <PageHeader title="Catalog Shot Set" subtitle="Generate consistent product photography across your entire catalog"><div /></PageHeader>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> Select products → choose fashion style → pick a model → set background → select shots → generate a consistent set.
        </p>
      </div>

      {/* 5-step breadcrumb */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const isActive = step === s.number;
          const isDone = step > s.number;
          const canClick = canNavigateTo(s.number);
          return (
            <div key={s.number} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => canClick && setStep(s.number)}
                disabled={!canClick}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  isActive && 'bg-primary text-primary-foreground shadow-md',
                  isDone && !isActive && 'bg-primary/10 text-primary cursor-pointer',
                  !isActive && !isDone && canClick && 'bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80',
                  !isActive && !isDone && !canClick && 'bg-muted text-muted-foreground opacity-40',
                )}
              >
                {isDone && !isActive ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.number}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('w-4 h-0.5 rounded-full', isDone ? 'bg-primary/40' : 'bg-border')} />
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
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          genderFilter={genderFilter}
          bodyTypeFilter={bodyTypeFilter}
          ageFilter={ageFilter}
          onGenderChange={setGenderFilter}
          onBodyTypeChange={setBodyTypeFilter}
          onAgeChange={setAgeFilter}
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
        />
      )}

      <BuyCreditsModal />
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={() => setShowAddProduct(false)} />
    </div>
  );
}
