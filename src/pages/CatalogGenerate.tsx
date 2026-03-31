import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useCredits } from '@/contexts/CreditContext';
import { useCatalogGenerate } from '@/hooks/useCatalogGenerate';
import { PageHeader } from '@/components/app/PageHeader';
import { CatalogMatrixSummary } from '@/components/app/CatalogMatrixSummary';
import { AddProductModal } from '@/components/app/AddProductModal';
import { CatalogStepProducts } from '@/components/app/catalog/CatalogStepProducts';
import { CatalogStepPoses } from '@/components/app/catalog/CatalogStepPoses';
import { CatalogStepModels } from '@/components/app/catalog/CatalogStepModels';
import { CatalogStepBackgrounds } from '@/components/app/catalog/CatalogStepBackgrounds';
import { CatalogStepStyleShots } from '@/components/app/catalog/CatalogStepStyleShots';
import { CatalogStepReview } from '@/components/app/catalog/CatalogStepReview';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { allCatalogItems } from '@/data/catalogPoses';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Package, Move, Users, Image, Wand2, Sparkles, Check } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';
import type { ShotOverride } from '@/components/app/catalog/CatalogShotStyler';
import type { ExtraItem } from '@/components/app/catalog/CatalogStepStyleShots';

const CATALOG_MAX_PRODUCTS = 50;
const CATALOG_MAX_MODELS = 10;

const STEPS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Poses', icon: Move },
  { number: 3, label: 'Models', icon: Users },
  { number: 4, label: 'Backgrounds', icon: Image },
  { number: 5, label: 'Style Shots', icon: Wand2 },
  { number: 6, label: 'Review', icon: Sparkles },
];

export default function CatalogGenerate() {
  const { user } = useAuth();
  const { balance, refreshBalance, openBuyModal } = useCredits();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Step 2 state
  const [selectedPoseIds, setSelectedPoseIds] = useState<Set<string>>(new Set());
  const [selectedMood, setSelectedMood] = useState('any');

  // Step 3 state
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  // Step 4 state
  const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<Set<string>>(new Set());

  // Step 5 state
  const [shotOverrides, setShotOverrides] = useState<Map<string, ShotOverride>>(new Map());
  const [extraItems, setExtraItems] = useState<Map<string, ExtraItem[]>>(new Map());

  // Generation
  const { startGeneration, batchState, isGenerating, resetBatch } = useCatalogGenerate();

  // Fetch products (raw rows for product step, mapped for generation)
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
    id: p.id,
    title: p.title,
    vendor: p.product_type || '',
    productType: p.product_type || '',
    images: [
      { url: p.image_url },
      ...(p.product_images || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((img: any) => ({ url: img.image_url })),
    ],
    tags: p.tags || [],
    description: p.description || '',
    status: 'active' as const,
    createdAt: p.created_at || '',
    updatedAt: p.updated_at || '',
  })), [userProducts]);

  // Models: full library + custom + user
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const libraryModels = useMemo(() => {
    const customIds = new Set(customModels.map(m => m.modelId));
    // Include mockModels + custom models, deduplicated
    return [...mockModels, ...customModels.filter(m => !mockModels.some(mm => mm.modelId === m.modelId))];
  }, [customModels]);

  const allModels = useMemo(() => [...libraryModels, ...userModelProfiles], [libraryModels, userModelProfiles]);
  const allPoses = useMemo(() => allCatalogItems, []);

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else if (next.size < CATALOG_MAX_MODELS) next.add(modelId);
      return next;
    });
  };

  const handlePoseToggle = (poseId: string) => {
    setSelectedPoseIds(prev => {
      const next = new Set(prev);
      if (next.has(poseId)) next.delete(poseId);
      else next.add(poseId);
      return next;
    });
  };

  const handleBackgroundToggle = (bgId: string) => {
    setSelectedBackgroundIds(prev => {
      const next = new Set(prev);
      if (next.has(bgId)) next.delete(bgId);
      else next.add(bgId);
      return next;
    });
  };

  const canStep1 = selectedProductIds.size >= 1;
  const canStep2 = selectedPoseIds.size >= 1;
  const canStep3 = selectedModelIds.size >= 1;
  const canStep4 = selectedBackgroundIds.size >= 1;

  const canNavigateTo = (s: number) => {
    if (s <= step) return true;
    if (s === 2) return canStep1;
    if (s === 3) return canStep1 && canStep2;
    if (s === 4) return canStep1 && canStep2 && canStep3;
    if (s === 5) return canStep1 && canStep2 && canStep3 && canStep4;
    if (s === 6) return canStep1 && canStep2 && canStep3 && canStep4;
    return false;
  };

  const handleGenerate = async () => {
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const selectedModelsArr = allModels.filter(m => selectedModelIds.has(m.modelId));

    await startGeneration({
      products: selectedProducts,
      models: selectedModelsArr,
      poseIds: Array.from(selectedPoseIds),
      backgroundIds: Array.from(selectedBackgroundIds),
      allPoses,
      shotOverrides,
      extraItems,
    });

    refreshBalance();
  };

  return (
    <div className="space-y-6 pb-32">
      <PageHeader
        title="Catalog Shot Set"
        subtitle="Generate consistent product photography across your entire catalog"
      >
        <div />
      </PageHeader>

      {/* Intro guidance */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> Select products → pick poses → choose models → set backgrounds → style individual shots → review &amp; generate. Each combination produces one image.
        </p>
      </div>

      {/* 6-step breadcrumb */}
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
                {isDone && !isActive ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
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
        <CatalogStepPoses
          selectedPoseIds={selectedPoseIds}
          onTogglePose={handlePoseToggle}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          canProceed={canStep2}
        />
      )}

      {step === 3 && (
        <CatalogStepModels
          libraryModels={libraryModels}
          userModels={userModelProfiles}
          selectedModelIds={selectedModelIds}
          onModelToggle={handleModelToggle}
          genderFilter={genderFilter}
          bodyTypeFilter={bodyTypeFilter}
          ageFilter={ageFilter}
          onGenderChange={setGenderFilter}
          onBodyTypeChange={setBodyTypeFilter}
          onAgeChange={setAgeFilter}
          maxModels={CATALOG_MAX_MODELS}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          canProceed={canStep3}
        />
      )}

      {step === 4 && (
        <CatalogStepBackgrounds
          selectedBackgroundIds={selectedBackgroundIds}
          onToggleBackground={handleBackgroundToggle}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          canProceed={canStep4}
        />
      )}

      {step === 5 && (
        <CatalogStepStyleShots
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          shotOverrides={shotOverrides}
          onShotOverridesChange={setShotOverrides}
          extraItems={extraItems}
          onExtraItemsChange={setExtraItems}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
        />
      )}

      {step === 6 && (
        <CatalogStepReview
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          selectedPoseIds={selectedPoseIds}
          selectedBackgroundIds={selectedBackgroundIds}
          allPoses={allPoses}
          balance={balance}
          onBack={() => setStep(5)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          batchState={batchState}
          onOpenBuyModal={openBuyModal}
        />
      )}

      {/* Sticky summary bar */}
      {step < 6 && (
        <CatalogMatrixSummary
          productCount={selectedProductIds.size}
          modelCount={selectedModelIds.size}
          poseCount={selectedPoseIds.size}
          backgroundCount={selectedBackgroundIds.size}
        />
      )}

      <BuyCreditsModal />
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={() => setShowAddProduct(false)} />
    </div>
  );
}
