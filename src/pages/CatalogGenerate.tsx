import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useCredits } from '@/contexts/CreditContext';
import { useCatalogGenerate } from '@/hooks/useCatalogGenerate';
import { PageHeader } from '@/components/app/PageHeader';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { CatalogMatrixSummary } from '@/components/app/CatalogMatrixSummary';
import { CatalogStepPoses } from '@/components/app/catalog/CatalogStepPoses';
import { CatalogStepBackgrounds } from '@/components/app/catalog/CatalogStepBackgrounds';
import { CatalogStepReview } from '@/components/app/catalog/CatalogStepReview';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { mockTryOnPoses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Package, Users, Move, Image, Sparkles } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

const CATALOG_MAX_PRODUCTS = 50;
const CATALOG_MAX_MODELS = 5;

export default function CatalogGenerate() {
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const [step, setStep] = useState(1);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  // Product selection state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');

  // Model selection state
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  // Pose & Background selection state
  const [selectedPoseIds, setSelectedPoseIds] = useState<Set<string>>(new Set());
  const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<Set<string>>(new Set());

  // Generation
  const { startGeneration, batchState, isGenerating, resetBatch } = useCatalogGenerate();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('*, product_images(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
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
      })) as Product[];
    },
    enabled: !!user,
  });

  // Fetch models
  const { asProfiles: systemModels } = useCustomModels();
  const { asProfiles: userModels } = useUserModels();
  const { asPoses: customScenes } = useCustomScenes();

  const allModels = useMemo(() => [...systemModels, ...userModels], [systemModels, userModels]);

  // All poses (for review step lookup)
  const allPoses = useMemo(() => [...mockTryOnPoses, ...customScenes], [customScenes]);

  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
      if (bodyTypeFilter !== 'all' && m.bodyType !== bodyTypeFilter) return false;
      if (ageFilter !== 'all' && m.ageRange !== ageFilter) return false;
      return true;
    });
  }, [allModels, genderFilter, bodyTypeFilter, ageFilter]);

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else if (next.size < CATALOG_MAX_MODELS) next.add(modelId);
      return next;
    });
  };

  const handlePoseToggle = (poseId: string) => {
    setSelectedPoseIds((prev) => {
      const next = new Set(prev);
      if (next.has(poseId)) next.delete(poseId);
      else next.add(poseId);
      return next;
    });
  };

  const handleBackgroundToggle = (bgId: string) => {
    setSelectedBackgroundIds((prev) => {
      const next = new Set(prev);
      if (next.has(bgId)) next.delete(bgId);
      else next.add(bgId);
      return next;
    });
  };

  const canProceedStep1 = selectedProductIds.size >= 1;
  const canProceedStep2 = selectedModelIds.size >= 1;
  const canProceedStep3 = selectedPoseIds.size >= 1;
  const canProceedStep4 = selectedBackgroundIds.size >= 1;

  const steps = [
    { number: 1, label: 'Products', icon: Package },
    { number: 2, label: 'Models', icon: Users },
    { number: 3, label: 'Poses', icon: Move },
    { number: 4, label: 'Backgrounds', icon: Image },
    { number: 5, label: 'Review', icon: Sparkles },
  ];

  const canNavigateTo = (stepNum: number) => {
    if (stepNum <= step) return true;
    if (stepNum === 2) return canProceedStep1;
    if (stepNum === 3) return canProceedStep1 && canProceedStep2;
    if (stepNum === 4) return canProceedStep1 && canProceedStep2 && canProceedStep3;
    if (stepNum === 5) return canProceedStep1 && canProceedStep2 && canProceedStep3 && canProceedStep4;
    return false;
  };

  const stepCounts = [
    selectedProductIds.size,
    selectedModelIds.size,
    selectedPoseIds.size,
    selectedBackgroundIds.size,
    0,
  ];

  const handleGenerate = async () => {
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const selectedModelsArr = allModels.filter(m => selectedModelIds.has(m.modelId));

    await startGeneration({
      products: selectedProducts,
      models: selectedModelsArr,
      poseIds: Array.from(selectedPoseIds),
      backgroundIds: Array.from(selectedBackgroundIds),
      allPoses,
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

      {/* Stepper */}
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => canNavigateTo(s.number) && setStep(s.number)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                step === s.number
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : s.number < step
                    ? 'bg-primary/10 text-primary cursor-pointer'
                    : canNavigateTo(s.number)
                      ? 'bg-muted text-muted-foreground cursor-pointer'
                      : 'bg-muted text-muted-foreground opacity-50'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span>{s.label}</span>
              {stepCounts[i] > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {stepCounts[i]}
                </Badge>
              )}
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Products */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Select Products</h2>
            <p className="text-sm text-muted-foreground">
              Choose up to {CATALOG_MAX_PRODUCTS} products for your catalog shoot
            </p>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No products yet</p>
              <p className="text-sm">Add products first to use catalog generation</p>
            </div>
          ) : (
            <ProductMultiSelect
              products={products}
              selectedIds={selectedProductIds}
              onSelectionChange={setSelectedProductIds}
              searchQuery={productSearch}
              onSearchChange={setProductSearch}
              enforceSameCategory={false}
              maxProducts={CATALOG_MAX_PRODUCTS}
            />
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="gap-2">
              Next: Select Models
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Models */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Select Models</h2>
            <p className="text-sm text-muted-foreground">
              Choose up to {CATALOG_MAX_MODELS} models ({selectedModelIds.size} selected)
            </p>
          </div>

          <ModelFilterBar
            genderFilter={genderFilter}
            bodyTypeFilter={bodyTypeFilter}
            ageFilter={ageFilter}
            onGenderChange={setGenderFilter}
            onBodyTypeChange={setBodyTypeFilter}
            onAgeChange={setAgeFilter}
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredModels.map((model) => (
              <ModelSelectorCard
                key={model.modelId}
                model={model}
                isSelected={selectedModelIds.has(model.modelId)}
                onSelect={() => handleModelToggle(model.modelId)}
              />
            ))}
          </div>

          {filteredModels.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No models match your filters</p>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="gap-2">
              Next: Select Poses
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Poses */}
      {step === 3 && (
        <CatalogStepPoses
          selectedPoseIds={selectedPoseIds}
          onTogglePose={handlePoseToggle}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          canProceed={canProceedStep3}
        />
      )}

      {/* Step 4: Backgrounds */}
      {step === 4 && (
        <CatalogStepBackgrounds
          selectedBackgroundIds={selectedBackgroundIds}
          onToggleBackground={handleBackgroundToggle}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          canProceed={canProceedStep4}
        />
      )}

      {/* Step 5: Review & Generate */}
      {step === 5 && (
        <CatalogStepReview
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          selectedPoseIds={selectedPoseIds}
          selectedBackgroundIds={selectedBackgroundIds}
          allPoses={allPoses}
          balance={balance}
          onBack={() => setStep(4)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          batchState={batchState}
          onOpenBuyModal={() => setBuyModalOpen(true)}
        />
      )}

      {/* Sticky summary bar */}
      {step < 5 && (
        <CatalogMatrixSummary
          productCount={selectedProductIds.size}
          modelCount={selectedModelIds.size}
          poseCount={selectedPoseIds.size}
          backgroundCount={selectedBackgroundIds.size}
        />
      )}

      <BuyCreditsModal open={buyModalOpen} onOpenChange={setBuyModalOpen} />
    </div>
  );
}
