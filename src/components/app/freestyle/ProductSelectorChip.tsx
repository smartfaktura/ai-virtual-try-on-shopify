import { useState } from 'react';
import { Package, ChevronDown, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;

interface ProductSelectorChipProps {
  selectedProduct: UserProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: UserProduct | null) => void;
  products: UserProduct[];
  isLoading: boolean;
}

export function ProductSelectorChip({
  selectedProduct, open, onOpenChange, onSelect, products, isLoading,
}: ProductSelectorChipProps) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.product_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors">
          {selectedProduct ? (
            <>
              <img src={selectedProduct.image_url} alt="" className="w-4 h-4 rounded object-cover" />
              <span className="max-w-[80px] truncate">{selectedProduct.title}</span>
              <button
                onClick={e => { e.stopPropagation(); onSelect(null); }}
                className="ml-0.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </>
          ) : (
            <>
              <Package className="w-3.5 h-3.5" />
              Add Product
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
          Your Products
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Package className="w-8 h-8 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No products yet</p>
            <Link
              to="/app/products"
              onClick={() => onOpenChange(false)}
              className="inline-block text-xs text-primary hover:underline font-medium"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <>
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-xs mb-2.5"
              autoFocus
            />

            {/* Selected product - clear option */}
            {selectedProduct && (
              <button
                onClick={() => { onSelect(null); onOpenChange(false); }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/80 transition-colors mb-2"
              >
                <X className="w-3 h-3" />
                Clear selection
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {filtered.map(product => (
                <button
                  key={product.id}
                  onClick={() => { onSelect(product); onOpenChange(false); setSearch(''); }}
                  className={cn(
                    'flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                    selectedProduct?.id === product.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full aspect-square object-cover rounded-t-md"
                  />
                  <div className="px-1.5 py-1.5 bg-background">
                    <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">
                      {product.title}
                    </p>
                    {product.product_type && (
                      <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                        {product.product_type}
                      </p>
                    )}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && search && (
                <p className="col-span-3 text-center text-xs text-muted-foreground py-4">
                  No matches found
                </p>
              )}
            </div>

            <div className="border-t border-border mt-2 pt-2">
              <Link
                to="/app/products"
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center gap-1 text-xs text-primary hover:underline font-medium py-1"
              >
                + Add new product
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
