import { useState } from 'react';
import { Check, Star, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from '@/components/app/product-images/types';

interface BundleProductPickerProps {
  products: UserProduct[];
  selectedIds: Set<string>;
  heroId: string | null;
  onToggle: (id: string) => void;
  onSetHero: (id: string) => void;
  isLoading?: boolean;
  maxProducts?: number;
}

export function BundleProductPicker({
  products,
  selectedIds,
  heroId,
  onToggle,
  onSetHero,
  isLoading,
  maxProducts = 5,
}: BundleProductPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.product_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={`Search ${products.length} products…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-full text-sm pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-muted-foreground/40"
            />
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant={selectedIds.size >= 2 ? 'default' : 'secondary'}>{selectedIds.size} selected</Badge>
          {selectedIds.size >= maxProducts && <span className="text-xs text-muted-foreground">(max {maxProducts})</span>}
          {selectedIds.size >= 2 && (
            <span className="text-xs text-muted-foreground">
              <Star className="w-3 h-3 inline mr-0.5 text-amber-400" />
              Tap the star to set hero product
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(p => {
            const isSelected = selectedIds.has(p.id);
            const isHero = heroId === p.id;
            const canSelect = isSelected || selectedIds.size < maxProducts;
            return (
              <button
                key={p.id}
                onClick={() => canSelect && onToggle(p.id)}
                disabled={!canSelect && !isSelected}
                className={cn(
                  'group relative rounded-xl overflow-hidden border-2 transition-all text-left',
                  isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-muted-foreground/40',
                  !canSelect && !isSelected && 'opacity-40 cursor-not-allowed'
                )}
              >
                <div className="aspect-square relative bg-muted">
                  <ShimmerImage
                    src={getOptimizedUrl(p.image_url, { quality: 60 })}
                    alt={p.title}
                    className="w-full h-full object-contain"
                  />
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  {isSelected && selectedIds.size >= 2 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetHero(p.id); }}
                      className={cn(
                        'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                        isHero
                          ? 'bg-amber-400 text-amber-900 shadow-md'
                          : 'bg-black/40 text-white/60 hover:text-white hover:bg-black/60'
                      )}
                      title={isHero ? 'Hero product' : 'Set as hero product'}
                    >
                      <Star className={cn('w-3.5 h-3.5', isHero && 'fill-current')} />
                    </button>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.product_type}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
