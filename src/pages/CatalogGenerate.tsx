import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels } from '@/hooks/useUserModels';
import { PageHeader } from '@/components/app/PageHeader';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { CatalogMatrixSummary } from '@/components/app/CatalogMatrixSummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Package, Users } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

const CATALOG_MAX_PRODUCTS = 50;
const CATALOG_MAX_MODELS = 5;

export default function CatalogGenerate() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Product selection state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState('');

  // Model selection state
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<ModelGender | 'all'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<ModelAgeRange | 'all'>('all');

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

  const allModels = useMemo(() => {
    const combined = [...systemModels, ...userModels];
    return combined;
  }, [systemModels, userModels]);

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
      if (next.has(modelId)) {
        next.delete(modelId);
      } else if (next.size < CATALOG_MAX_MODELS) {
        next.add(modelId);
      }
      return next;
    });
  };

  const canProceedStep1 = selectedProductIds.size >= 1;
  const canProceedStep2 = selectedModelIds.size >= 1;

  const steps = [
    { number: 1, label: 'Products', icon: Package },
    { number: 2, label: 'Models', icon: Users },
  ];

  return (
    <div className="space-y-6 pb-32">
      <PageHeader
        title="Catalog Shot Set"
        subtitle="Generate consistent product photography across your entire catalog"
      >
        <div />
      </PageHeader>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.number < step || (s.number === 2 && canProceedStep1)) {
                  setStep(s.number);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                step === s.number
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : s.number < step
                    ? 'bg-primary/10 text-primary cursor-pointer'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span>
                {s.label}
              </span>
              {s.number === 1 && selectedProductIds.size > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {selectedProductIds.size}
                </Badge>
              )}
              {s.number === 2 && selectedModelIds.size > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {selectedModelIds.size}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Select Products</h2>
              <p className="text-sm text-muted-foreground">
                Choose up to {CATALOG_MAX_PRODUCTS} products for your catalog shoot
              </p>
            </div>
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
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="gap-2"
            >
              Next: Select Models
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Models */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Select Models</h2>
              <p className="text-sm text-muted-foreground">
                Choose up to {CATALOG_MAX_MODELS} models ({selectedModelIds.size} selected)
              </p>
            </div>
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
            <p className="text-center text-muted-foreground py-8">
              No models match your filters
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button disabled={!canProceedStep2} className="gap-2">
              Continue to Poses
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sticky summary bar */}
      <CatalogMatrixSummary
        productCount={selectedProductIds.size}
        modelCount={selectedModelIds.size}
        poseCount={0}
        backgroundCount={0}
      />
    </div>
  );
}
