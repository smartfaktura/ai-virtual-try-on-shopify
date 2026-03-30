import { useState } from 'react';
import { Package, ChevronDown, X, Loader2, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePickerSheet } from './MobilePickerSheet';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { Tables } from '@/integrations/supabase/types';

const SAMPLE_PRODUCTS = [
  {
    id: 'sample_ring',
    title: 'Diamond Ring',
    product_type: 'Jewelry',
    image_url: '/images/samples/sample-ring.png',
  },
  {
    id: 'sample_crop_top',
    title: 'Ribbed Crop Top',
    product_type: 'Clothing',
    image_url: '/images/samples/sample-crop-top.png',
  },
  {
    id: 'sample_ice_roller',
    title: 'Ice Roller',
    product_type: 'Beauty',
    image_url: '/images/samples/sample-ice-roller.png',
  },
] as const;

type UserProduct = Tables<'user_products'>;

interface ProductSelectorChipProps {
  selectedProduct: UserProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: UserProduct | null) => void;
  products: UserProduct[];
  isLoading: boolean;
  modal?: boolean;
  fullWidth?: boolean;
}

export function ProductSelectorChip({
  selectedProduct, open, onOpenChange, onSelect, products, isLoading, modal, fullWidth,
}: ProductSelectorChipProps) {
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.product_type.toLowerCase().includes(search.toLowerCase())
  );

  const triggerButton = (
    <button
      onClick={isMobile ? () => onOpenChange(!open) : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors min-w-0",
        fullWidth ? "w-full max-w-none" : "max-w-[140px]"
      )}
    >
      {selectedProduct ? (
        <>
          <img src={getOptimizedUrl(selectedProduct.image_url, { quality: 60 })} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
          <span className="truncate flex-1 min-w-0 text-left">{selectedProduct.title}</span>
          <button
            onClick={e => { e.stopPropagation(); onSelect(null); }}
            className="ml-0.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors shrink-0"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </>
      ) : (
        <>
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Product</span>
        </>
      )}
      <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
    </button>
  );

  const content = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
        </div>
      ) : products.length === 0 ? (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <Package className="w-8 h-8 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No products yet</p>
            <p className="text-xs text-muted-foreground">Try with a sample or add your own</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">Try with a sample</p>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_PRODUCTS.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => {
                    onSelect({
                      id: sample.id,
                      title: sample.title,
                      product_type: sample.product_type,
                      image_url: sample.image_url,
                      description: '',
                      dimensions: null,
                      tags: null,
                      user_id: '',
                      created_at: '',
                      updated_at: '',
                    } as UserProduct);
                    onOpenChange(false);
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="relative w-full aspect-square rounded-xl border-2 border-border overflow-hidden group-hover:border-primary transition-colors bg-muted">
                    <Badge variant="secondary" className="absolute top-1 left-1 z-10 text-[9px] px-1.5 py-0 h-4 bg-muted-foreground/10 text-muted-foreground border-0">Draft</Badge>
                    <ShimmerImage src={getOptimizedUrl(sample.image_url, { quality: 60 })} alt={sample.title} className="w-full h-full object-contain bg-muted/30" />
                  </div>
                  <p className="text-[10px] font-medium text-foreground mt-1.5 text-center line-clamp-1">{sample.title}</p>
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/app/products"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center gap-1.5 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your Own Product
          </Link>
        </div>
      ) : (
        <>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-base mb-2.5"
          />

          {selectedProduct && (
            <button
              onClick={() => { onSelect(null); onOpenChange(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/80 transition-colors mb-2"
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          )}

          <div className={cn("grid gap-2 max-h-64 overflow-y-auto pr-1", isMobile ? "grid-cols-2" : "grid-cols-3")}>
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
                <ShimmerImage
                  src={getOptimizedUrl(product.image_url, { quality: 60 })}
                  alt={product.title}
                  className="w-full aspect-square object-cover rounded-t-md bg-muted/30"
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
    </>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <MobilePickerSheet open={open} onOpenChange={onOpenChange} title="Your Products" minHeight="half">
          {content}
        </MobilePickerSheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
          Your Products
        </p>
        {content}
      </PopoverContent>
    </Popover>
  );
}
