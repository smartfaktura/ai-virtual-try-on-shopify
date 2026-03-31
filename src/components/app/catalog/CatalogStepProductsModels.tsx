import { useMemo } from 'react';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Package, Users } from 'lucide-react';
import type { Product, ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

interface CatalogStepProductsModelsProps {
  products: Product[];
  productsLoading: boolean;
  selectedProductIds: Set<string>;
  onProductSelectionChange: (ids: Set<string>) => void;
  productSearch: string;
  onProductSearchChange: (s: string) => void;
  allModels: ModelProfile[];
  selectedModelIds: Set<string>;
  onModelToggle: (id: string) => void;
  genderFilter: ModelGender | 'all';
  bodyTypeFilter: ModelBodyType | 'all';
  ageFilter: ModelAgeRange | 'all';
  onGenderChange: (v: ModelGender | 'all') => void;
  onBodyTypeChange: (v: ModelBodyType | 'all') => void;
  onAgeChange: (v: ModelAgeRange | 'all') => void;
  maxProducts: number;
  maxModels: number;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepProductsModels({
  products, productsLoading, selectedProductIds, onProductSelectionChange,
  productSearch, onProductSearchChange,
  allModels, selectedModelIds, onModelToggle,
  genderFilter, bodyTypeFilter, ageFilter,
  onGenderChange, onBodyTypeChange, onAgeChange,
  maxProducts, maxModels, onNext, canProceed,
}: CatalogStepProductsModelsProps) {
  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
      if (bodyTypeFilter !== 'all' && m.bodyType !== bodyTypeFilter) return false;
      if (ageFilter !== 'all' && m.ageRange !== ageFilter) return false;
      return true;
    });
  }, [allModels, genderFilter, bodyTypeFilter, ageFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Products</h3>
            <Badge variant="secondary" className="text-[10px]">
              {selectedProductIds.size}/{maxProducts}
            </Badge>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No products yet</p>
              <p className="text-xs">Add products first</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-border p-2">
              <ProductMultiSelect
                products={products}
                selectedIds={selectedProductIds}
                onSelectionChange={onProductSelectionChange}
                searchQuery={productSearch}
                onSearchChange={onProductSearchChange}
                enforceSameCategory={false}
                maxProducts={maxProducts}
              />
            </div>
          )}
        </div>

        {/* Models Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Models</h3>
            <Badge variant="secondary" className="text-[10px]">
              {selectedModelIds.size}/{maxModels}
            </Badge>
          </div>

          <ModelFilterBar
            genderFilter={genderFilter}
            bodyTypeFilter={bodyTypeFilter}
            ageFilter={ageFilter}
            onGenderChange={onGenderChange}
            onBodyTypeChange={onBodyTypeChange}
            onAgeChange={onAgeChange}
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[440px] overflow-y-auto rounded-xl border border-border p-2">
            {filteredModels.map((model) => (
              <ModelSelectorCard
                key={model.modelId}
                model={model}
                isSelected={selectedModelIds.has(model.modelId)}
                onSelect={() => onModelToggle(model.modelId)}
              />
            ))}
            {filteredModels.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-8">No models match filters</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Visual Style
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
