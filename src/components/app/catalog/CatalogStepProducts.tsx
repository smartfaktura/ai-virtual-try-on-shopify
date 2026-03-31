import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { ChevronRight, Package, Search, LayoutGrid, List, Check } from 'lucide-react';

interface UserProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

const PRODUCTS_PER_PAGE = 24;

interface CatalogStepProductsProps {
  products: UserProduct[];
  productsLoading: boolean;
  selectedProductIds: Set<string>;
  onProductSelectionChange: (ids: Set<string>) => void;
  maxProducts: number;
  onNext: () => void;
  canProceed: boolean;
  onAddProduct: () => void;
}

export function CatalogStepProducts({
  products, productsLoading, selectedProductIds, onProductSelectionChange,
  maxProducts, onNext, canProceed, onAddProduct,
}: CatalogStepProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const visible = filtered.slice(0, visibleCount);

  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < maxProducts) next.add(id);
    onProductSelectionChange(next);
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No products yet</p>
          <p className="text-xs mb-3">Add products first to get started</p>
          <Button size="sm" onClick={onAddProduct}>Add Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }}
            className="h-8 text-xs pl-8"
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
          onProductSelectionChange(new Set(filtered.slice(0, maxProducts).map(p => p.id)));
        }}>
          Select All
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onProductSelectionChange(new Set())}>
          Clear
        </Button>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {selectedProductIds.size > 0 && (
        <div className="flex gap-2 items-center">
          <Badge variant={selectedProductIds.size >= 2 ? 'default' : 'secondary'}>{selectedProductIds.size} selected</Badge>
          <span className="text-xs text-muted-foreground">(max {maxProducts})</span>
        </div>
      )}

      {filtered.length === 0 && searchQuery && (
        <p className="text-center text-sm text-muted-foreground py-6">No products match "{searchQuery}"</p>
      )}

      {filtered.length > 0 && viewMode === 'list' && (
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
          {visible.map(up => {
            const isSelected = selectedProductIds.has(up.id);
            const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
            return (
              <button
                key={up.id}
                type="button"
                onClick={() => toggleProduct(up.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left',
                  isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{up.title}</p>
                  {up.product_type && <p className="text-[10px] text-muted-foreground truncate">{up.product_type}</p>}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
                )}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {visible.map(up => {
              const isSelected = selectedProductIds.has(up.id);
              const isDisabled = !isSelected && selectedProductIds.size >= maxProducts;
              return (
                <button
                  key={up.id}
                  type="button"
                  onClick={() => toggleProduct(up.id)}
                  disabled={isDisabled}
                  className={cn(
                    'group relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                    isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
                    isDisabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : 'border-background/80 bg-background/60 opacity-0 group-hover:opacity-100'
                  )}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <ShimmerImage src={getOptimizedUrl(up.image_url, { quality: 60 })} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                  <div className="px-1.5 py-1.5 bg-card">
                    <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                    {up.product_type && (
                      <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={onAddProduct}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all aspect-square text-muted-foreground"
            >
              <Package className="w-6 h-6 mb-1 opacity-50" />
              <span className="text-[10px] font-medium">Add New</span>
            </button>
          </div>
          {filtered.length > visibleCount && (
            <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + PRODUCTS_PER_PAGE)} className="w-full mt-3">
              Load more ({filtered.length - visibleCount} remaining)
            </Button>
          )}
        </>
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
