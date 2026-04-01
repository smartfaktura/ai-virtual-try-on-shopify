import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getFashionStyle, getBackground, getShotDefinition } from '@/lib/catalogEngine';
import { cn } from '@/lib/utils';
import { ChevronLeft, Sparkles, Loader2, Package, Users, Camera, Palette, Ban, ArrowRight, Gem } from 'lucide-react';
import type { Product, ModelProfile } from '@/types';
import type { FashionStyleId, CatalogShotId } from '@/types/catalog';

interface PropProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

const CREDITS_PER_IMAGE = 4;

interface CatalogStepReviewV2Props {
  products: Product[];
  models: ModelProfile[];
  productOnlyMode: boolean;
  fashionStyleId: FashionStyleId | null;
  backgroundId: string | null;
  selectedShots: Set<CatalogShotId>;
  propAssignments: Record<string, string[]>;
  allProducts: PropProduct[];
  totalImages: number;
  totalCredits: number;
  balance: number;
  isGenerating: boolean;
  onBack: () => void;
  onGenerate: () => void;
  onOpenBuyModal: () => void;
}

export function CatalogStepReviewV2({
  products, models, productOnlyMode, fashionStyleId, backgroundId,
  selectedShots, propAssignments, allProducts, totalImages, totalCredits, balance, isGenerating,
  onBack, onGenerate, onOpenBuyModal,
}: CatalogStepReviewV2Props) {
  const style = fashionStyleId ? getFashionStyle(fashionStyleId) : null;
  const bg = backgroundId ? getBackground(backgroundId) : null;
  const shots = useMemo(() => Array.from(selectedShots).map(id => getShotDefinition(id)).filter(Boolean), [selectedShots]);
  const hasEnoughCredits = balance >= totalCredits;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Review & Generate</h3>
        <p className="text-sm text-muted-foreground mt-1">Confirm your catalog settings before generating.</p>
      </div>

      {/* Visual summary strip */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Product thumbnails */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Products</span>
            <Badge variant="secondary" className="text-[9px] ml-auto">{products.length}</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {products.map(p => (
              <div key={p.id} className="flex-shrink-0 w-14">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                  {p.images[0]?.url ? (
                    <ShimmerImage src={getOptimizedUrl(p.images[0].url, { quality: 50 })} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 truncate text-center">{p.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Models strip */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">{productOnlyMode ? 'Product Only' : 'Models'}</span>
            {!productOnlyMode && <Badge variant="secondary" className="text-[9px] ml-auto">{models.length}</Badge>}
          </div>
          {productOnlyMode ? (
            <p className="text-xs text-muted-foreground">Packshots and product-only images</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {models.map(m => (
                <div key={m.modelId} className="flex-shrink-0 w-12">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted ring-1 ring-border">
                    {m.previewUrl ? (
                      <img src={getOptimizedUrl(m.previewUrl, { quality: 50 })} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1 truncate text-center">{m.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style + Background row */}
        <div className="p-4 border-b border-border flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{style?.label || '—'}</span>
          </div>
          {bg && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: bg.hex }} />
              <span className="text-xs font-medium text-foreground">{bg.label}</span>
            </div>
          )}
        </div>

        {/* Styling Props summary */}
        {(() => {
          const combosWithProps = Object.values(propAssignments).filter(ids => ids.length > 0).length;
          if (combosWithProps === 0) return null;
          const uniquePropIds = new Set(Object.values(propAssignments).flat());
          const propItems = Array.from(uniquePropIds).map(id => allProducts.find(p => p.id === id)).filter(Boolean) as PropProduct[];
          return (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Styling Props</span>
                <Badge variant="secondary" className="text-[9px] ml-auto">{combosWithProps}/{totalImages} shots</Badge>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {propItems.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-14">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                      <ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 50 })} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 truncate text-center">{p.title}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Shots list */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Shots</span>
            <Badge variant="secondary" className="text-[9px] ml-auto">{shots.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shots.map(s => (
              <span key={s!.id} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">{s!.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Credit calculation */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="font-medium">{products.length} product{products.length !== 1 ? 's' : ''}</span>
          {!productOnlyMode && models.length > 0 && (
            <>
              <span className="text-muted-foreground">×</span>
              <span className="font-medium">{models.length} model{models.length !== 1 ? 's' : ''}</span>
            </>
          )}
          <span className="text-muted-foreground">×</span>
          <span className="font-medium">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">×</span>
          <span className="font-medium">{CREDITS_PER_IMAGE} cr</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-lg font-bold text-foreground">{totalCredits} credits</span>
          <span className="text-[10px] text-muted-foreground">({totalImages} images)</span>
        </div>
        <div className={cn(
          'flex items-center justify-between rounded-lg p-3',
          hasEnoughCredits ? 'bg-card border border-border' : 'bg-destructive/5 border border-destructive/20',
        )}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{totalCredits} credits needed</span>
          </div>
          {hasEnoughCredits ? (
            <span className="text-xs text-muted-foreground">{balance} available</span>
          ) : (
            <button onClick={onOpenBuyModal} className="flex items-center gap-1 text-xs text-destructive font-semibold hover:underline">
              <Ban className="w-3 h-3" />
              {balance} available — need {totalCredits - balance} more
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={hasEnoughCredits ? onGenerate : onOpenBuyModal}
          disabled={isGenerating || totalImages === 0}
          className="gap-2 px-6"
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {hasEnoughCredits ? `Generate ${totalImages} Images` : 'Buy Credits'}
          {hasEnoughCredits && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
