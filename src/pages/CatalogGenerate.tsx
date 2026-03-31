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
import { CatalogStepProductsModels } from '@/components/app/catalog/CatalogStepProductsModels';
import { CatalogStepStyle } from '@/components/app/catalog/CatalogStepStyle';
import { CatalogStepReview } from '@/components/app/catalog/CatalogStepReview';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { allCatalogItems } from '@/data/catalogPoses';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, Palette, Sparkles, Check } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';
import type { ShotOverride } from '@/components/app/catalog/CatalogShotStyler';

const CATALOG_MAX_PRODUCTS = 50;
const CATALOG_MAX_MODELS = 5;

const STEPS = [
  { number: 1, label: 'Products & Models', icon: Package },
  { number: 2, label: 'Visual Style', icon: Palette },
  { number: 3, label: 'Review', icon: Sparkles },
];

export default function CatalogGenerate() {
  const { user } = useAuth();
  const { balance, refreshBalance, openBuyModal } = useCredits();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  // Step 2 state
  const [selectedPoseIds, setSelectedPoseIds] = useState<Set<string>>(new Set());
  const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<Set<string>>(new Set());
  const [shotOverrides, setShotOverrides] = useState<Map<string, ShotOverride>>(new Map());

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
  const allModels = useMemo(() => [...systemModels, ...userModels], [systemModels, userModels]);
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

  const canStep1 = selectedProductIds.size >= 1 && selectedModelIds.size >= 1;
  const canStep2 = selectedPoseIds.size >= 1 && selectedBackgroundIds.size >= 1;

  const canNavigateTo = (s: number) => {
    if (s <= step) return true;
    if (s === 2) return canStep1;
    if (s === 3) return canStep1 && canStep2;
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
          <strong className="text-foreground">How it works:</strong> Select your products and models → pick poses &amp; backgrounds → review your matrix → generate your entire catalog in one batch. Each combination produces one image.
        </p>
      </div>

      {/* Minimal 3-step breadcrumb */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isActive = step === s.number;
          const isDone = step > s.number;
          const canClick = canNavigateTo(s.number);

          return (
            <div key={s.number} className="flex items-center gap-1">
              <button
                onClick={() => canClick && setStep(s.number)}
                disabled={!canClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  isActive && 'bg-primary text-primary-foreground shadow-md',
                  isDone && !isActive && 'bg-primary/10 text-primary cursor-pointer',
                  !isActive && !isDone && canClick && 'bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80',
                  !isActive && !isDone && !canClick && 'bg-muted text-muted-foreground opacity-40',
                )}
              >
                {isDone && !isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.number}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('w-8 h-0.5 rounded-full', isDone ? 'bg-primary/40' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <CatalogStepProductsModels
          products={products}
          productsLoading={productsLoading}
          selectedProductIds={selectedProductIds}
          onProductSelectionChange={setSelectedProductIds}
          productSearch={productSearch}
          onProductSearchChange={setProductSearch}
          allModels={allModels}
          selectedModelIds={selectedModelIds}
          onModelToggle={handleModelToggle}
          genderFilter={genderFilter}
          bodyTypeFilter={bodyTypeFilter}
          ageFilter={ageFilter}
          onGenderChange={setGenderFilter}
          onBodyTypeChange={setBodyTypeFilter}
          onAgeChange={setAgeFilter}
          maxProducts={CATALOG_MAX_PRODUCTS}
          maxModels={CATALOG_MAX_MODELS}
          onNext={() => setStep(2)}
          canProceed={canStep1}
        />
      )}

      {step === 2 && (
        <CatalogStepStyle
          selectedPoseIds={selectedPoseIds}
          onTogglePose={handlePoseToggle}
          selectedBackgroundIds={selectedBackgroundIds}
          onToggleBackground={handleBackgroundToggle}
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          shotOverrides={shotOverrides}
          onShotOverridesChange={setShotOverrides}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          canProceed={canStep2}
        />
      )}

      {step === 3 && (
        <CatalogStepReview
          products={products}
          selectedProductIds={selectedProductIds}
          models={allModels}
          selectedModelIds={selectedModelIds}
          selectedPoseIds={selectedPoseIds}
          selectedBackgroundIds={selectedBackgroundIds}
          allPoses={allPoses}
          balance={balance}
          onBack={() => setStep(2)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          batchState={batchState}
          onOpenBuyModal={openBuyModal}
        />
      )}

      {/* Sticky summary bar */}
      {step < 3 && (
        <CatalogMatrixSummary
          productCount={selectedProductIds.size}
          modelCount={selectedModelIds.size}
          poseCount={selectedPoseIds.size}
          backgroundCount={selectedBackgroundIds.size}
        />
      )}

      <BuyCreditsModal />
    </div>
  );
}
