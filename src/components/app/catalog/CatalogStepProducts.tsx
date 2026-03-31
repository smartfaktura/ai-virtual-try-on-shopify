import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Package } from 'lucide-react';
import type { Product } from '@/types';

interface CatalogStepProductsProps {
  products: Product[];
  productsLoading: boolean;
  selectedProductIds: Set<string>;
  onProductSelectionChange: (ids: Set<string>) => void;
  productSearch: string;
  onProductSearchChange: (s: string) => void;
  maxProducts: number;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepProducts({
  products, productsLoading, selectedProductIds, onProductSelectionChange,
  productSearch, onProductSearchChange, maxProducts, onNext, canProceed,
}: CatalogStepProductsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Products</h3>
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
          <p className="text-xs">Add products first to get started</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-3">
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

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Poses
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
