import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { Gem, Search, Check, X, SkipForward } from 'lucide-react';
import type { UserProduct } from './types';

interface Step3PropsProps {
  allProducts: UserProduct[];
  heroProductIds: Set<string>;
  propProductIds: Set<string>;
  onPropSelectionChange: (ids: Set<string>) => void;
}

export function ProductImagesStep3Props({ allProducts, heroProductIds, propProductIds, onPropSelectionChange }: Step3PropsProps) {
  const [search, setSearch] = useState('');

  const availableProps = useMemo(
    () => allProducts.filter(p => !heroProductIds.has(p.id)),
    [allProducts, heroProductIds],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return availableProps;
    const q = search.toLowerCase();
    return availableProps.filter(p =>
      p.title.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q)
    );
  }, [availableProps, search]);

  const toggleProp = (id: string) => {
    const next = new Set(propProductIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onPropSelectionChange(next);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Add Styling Props</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick extra products to style alongside your hero products <span className="text-muted-foreground/60">(optional)</span>
        </p>
      </div>

      {availableProps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
          <Gem className="w-6 h-6 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No additional products available as props.</p>
          <p className="text-xs text-muted-foreground/60">Add more products to your library to use them as styling accessories.</p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search props..."
                className="pl-8 h-8 text-xs"
              />
            </div>
            {propProductIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{propProductIds.size} prop{propProductIds.size !== 1 ? 's' : ''}</Badge>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onPropSelectionChange(new Set())}>Clear</Button>
              </div>
            )}
          </div>

          {/* Selected props strip */}
          {propProductIds.size > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from(propProductIds).map(id => {
                const p = allProducts.find(pr => pr.id === id);
                if (!p) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-md pl-0.5 pr-1.5 py-0.5 font-medium">
                    <div className="w-5 h-5 rounded overflow-hidden bg-white flex-shrink-0 p-0.5">
                      <ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 40 })} alt={p.title} className="w-full h-full object-contain" />
                    </div>
                    {p.title.length > 16 ? p.title.slice(0, 14) + '…' : p.title}
                    <button onClick={() => toggleProp(id)} className="hover:text-destructive transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filtered.map(p => {
              const isSelected = propProductIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProp(p.id)}
                  className={cn(
                    'group relative flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left',
                    isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]' : 'border-border hover:border-primary/30',
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="w-full aspect-square bg-white flex items-center justify-center p-2">
                    <ShimmerImage src={getOptimizedUrl(p.image_url, { width: 160, quality: 60 })} alt={p.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-medium text-foreground line-clamp-2 leading-tight">{p.title}</p>
                    {p.product_type && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{p.product_type}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && search && (
            <p className="text-center text-sm text-muted-foreground py-6">No products match "{search}"</p>
          )}
        </>
      )}
    </div>
  );
}
