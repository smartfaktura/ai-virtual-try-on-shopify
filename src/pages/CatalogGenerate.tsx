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
import { CatalogStepExpression } from '@/components/app/catalog/CatalogStepExpression';
import { CatalogStepModels } from '@/components/app/catalog/CatalogStepModels';
import { CatalogStepBackgrounds } from '@/components/app/catalog/CatalogStepBackgrounds';
import { CatalogStepStyleShots } from '@/components/app/catalog/CatalogStepStyleShots';
import { CatalogStepReview } from '@/components/app/catalog/CatalogStepReview';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { allCatalogItems } from '@/data/catalogPoses';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Package, Move, Smile, Users, Image, Wand2, Sparkles, Check } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';
import type { ExtraItem } from '@/components/app/catalog/CatalogStepStyleShots';

const CATALOG_MAX_PRODUCTS = 50;
const CATALOG_MAX_MODELS = 10;

const STEPS = [
  { number: 1, label: 'Products', icon: Package },
  { number: 2, label: 'Poses', icon: Move },
  { number: 3, label: 'Expression', icon: Smile },
  { number: 4, label: 'Models', icon: Users },
  { number: 5, label: 'Backgrounds', icon: Image },
  { number: 6, label: 'Style Shots', icon: Wand2 },
  { number: 7, label: 'Review', icon: Sparkles },
];

const STEP_NEXT_LABELS: Record<number, string> = { 1: 'Poses', 2: 'Expression', 3: 'Models', 4: 'Backgrounds', 5: 'Style Shots', 6: 'Review' };

export default function CatalogGenerate() {
  const { user } = useAuth();
  const { balance, refreshBalance, openBuyModal } = useCredits();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Step 2 state
  const [selectedPoseIds, setSelectedPoseIds] = useState<Set<string>>(new Set());

  // Step 3 state
  const [selectedMood, setSelectedMood] = useState('neutral');

  // Step 4 state
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  // Step 5 state
  const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<Set<string>>(new Set());

  // Step 6 state
  const [extraItems, setExtraItems] = useState<Map<string, ExtraItem[]>>(new Map());

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

  // Models
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const libraryModels = useMemo(() => {
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
  // Step 3 (expression) always passes — 'any' is default
  const canStep4 = selectedModelIds.size >= 1;
  const canStep5 = selectedBackgroundIds.size >= 1;

  const canNavigateTo = (s: number) => {
    if (s <= step) return true;
    if (s === 2) return canStep1;
    if (s === 3) return canStep1 && canStep2;
    if (s === 4) return canStep1 && canStep2;
    if (s === 5) return canStep1 && canStep2 && canStep4;
    if (s === 6) return canStep1 && canStep2 && canStep4 && canStep5;
    if (s === 7) return canStep1 && canStep2 && canStep4 && canStep5;
    return false;
  };

  const canProceedCurrent = step === 1 ? canStep1 : step === 2 ? canStep2 : step === 3 ? true : step === 4 ? canStep4 : step === 5 ? canStep5 : true;

  const handleGenerate = async () => {
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const selectedModelsArr = allModels.filter(m => selectedModelIds.has(m.modelId));

    await startGeneration({
      products: selectedProducts,
      models: selectedModelsArr,
      poseIds: Array.from(selectedPoseIds),
      backgroundIds: Array.from(selectedBackgroundIds),
      allPoses,
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
          <strong className="text-foreground">How it works:</strong> Select products → pick poses → choose expression → select models → set backgrounds → style individual shots → review &amp; generate.
        </p>
      </div>

      {/* 7-step breadcrumb */}
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
        <CatalogStepExpression
          selectedMood={selectedMood}
          onMoodChange={setSelectedMood}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
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
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          canProceed={canStep4}
        />
      )}

      {step === 5 && (
        <CatalogStepBackgrounds
          selectedBackgroundIds={selectedBackgroundIds}
          onToggleBackground={handleBackgroundToggle}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
          canProceed={canStep5}
        />
      )}

      {step === 6 && (
        <CatalogStepStyleShots
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          shotOverrides={shotOverrides}
          onShotOverridesChange={setShotOverrides}
          extraItems={extraItems}
          onExtraItemsChange={setExtraItems}
          onBack={() => setStep(5)}
          onNext={() => setStep(7)}
        />
      )}

      {step === 7 && (
        <CatalogStepReview
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          selectedPoseIds={selectedPoseIds}
          selectedBackgroundIds={selectedBackgroundIds}
          allPoses={allPoses}
          balance={balance}
          onBack={() => setStep(6)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          batchState={batchState}
          onOpenBuyModal={openBuyModal}
        />
      )}

      {/* Sticky summary bar */}
      {step < 7 && (
        <CatalogMatrixSummary
          productCount={selectedProductIds.size}
          modelCount={selectedModelIds.size}
          poseCount={selectedPoseIds.size}
          backgroundCount={selectedBackgroundIds.size}
          step={step}
          totalSteps={6}
          stepLabel={STEP_NEXT_LABELS[step] ?? 'Review'}
          onBack={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(7, step + 1))}
          canProceed={canProceedCurrent}
        />
      )}

      <BuyCreditsModal />
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} onProductAdded={() => setShowAddProduct(false)} />
    </div>
  );
}
