import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import { ChevronLeft, ArrowRight, Gem, SkipForward } from 'lucide-react';

interface PropProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

interface CatalogStepPropsProps {
  /** All user products from library */
  allProducts: PropProduct[];
  /** IDs of hero products (excluded from props selection) */
  heroProductIds: Set<string>;
  /** Currently selected prop IDs */
  selectedPropIds: Set<string>;
  onPropSelectionChange: (ids: Set<string>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CatalogStepProps({
  allProducts, heroProductIds, selectedPropIds,
  onPropSelectionChange, onBack, onNext,
}: CatalogStepPropsProps) {
  const availableProps = useMemo(
    () => allProducts.filter(p => !heroProductIds.has(p.id)),
    [allProducts, heroProductIds],
  );

  const handleToggle = (id: string) => {
    const next = new Set(selectedPropIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onPropSelectionChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Add Styling Props</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pick extra items from your library to appear in every shot <span className="text-muted-foreground/60">(optional)</span>
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
          {selectedPropIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">{selectedPropIds.size} prop{selectedPropIds.size !== 1 ? 's' : ''} selected</Badge>
              <button onClick={() => onPropSelectionChange(new Set())} className="text-[10px] text-muted-foreground hover:text-foreground underline">
                Clear all
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto p-0.5">
            {availableProps.map(product => {
              const isSelected = selectedPropIds.has(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => handleToggle(product.id)}
                  className={cn(
                    'relative rounded-lg border-2 p-2 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="absolute top-1.5 left-1.5 z-10 bg-background/90 rounded shadow-sm p-0.5">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                  </div>
                  {isSelected && (
                    <Badge className="absolute top-1.5 right-1.5 z-10 text-[8px] px-1.5 py-0" variant="default">
                      PROP
                    </Badge>
                  )}
                  <div className="aspect-square rounded overflow-hidden mb-2 bg-muted">
                    <ShimmerImage
                      src={getOptimizedUrl(product.image_url, { width: 180, quality: 50 })}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <p className="text-[10px] font-medium truncate text-foreground">{product.title}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{product.product_type}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          {selectedPropIds.size === 0 && (
            <button onClick={onNext} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-3.5 h-3.5" /> Skip — no props
            </button>
          )}
          <Button onClick={onNext} className="gap-2">
            {selectedPropIds.size > 0 ? `Next with ${selectedPropIds.size} prop${selectedPropIds.size !== 1 ? 's' : ''}` : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
