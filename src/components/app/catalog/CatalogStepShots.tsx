import { useMemo, useState } from 'react';
import { getCompatibleShots, getRecommendedShotIds } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Package, Check, Camera, Layers, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCategory, CatalogShotId, ShotDefinition } from '@/types/catalog';

interface CatalogStepShotsProps {
  productCategory: ProductCategory;
  hasModel: boolean;
  selectedShots: Set<CatalogShotId>;
  onToggleShot: (id: CatalogShotId) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  totalImages: number;
  totalCredits: number;
  balance: number;
  onOpenBuyModal: () => void;
  onPreselectRecommended: (ids: CatalogShotId[]) => void;
  productCount: number;
  modelCount: number;
}

export function CatalogStepShots({
  productCategory, hasModel, selectedShots, onToggleShot,
  onBack, onNext, canProceed,
  totalImages, totalCredits, balance, onOpenBuyModal,
  onPreselectRecommended, productCount, modelCount,
}: CatalogStepShotsProps) {
  const compatible = useMemo(() => getCompatibleShots(productCategory, hasModel), [productCategory, hasModel]);
  const recommended = useMemo(() => getRecommendedShotIds(productCategory, hasModel), [productCategory, hasModel]);
  const [onModelOpen, setOnModelOpen] = useState(true);
  const [productOnlyOpen, setProductOnlyOpen] = useState(true);

  const onModelShots = compatible.filter(s => s.group === 'on-model');
  const productOnlyShots = compatible.filter(s => s.group === 'product-only');
  const recommendedSet = new Set(recommended);

  return (
    <div className="space-y-6 pb-36">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Select Shots</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose angles and views for your catalog.
            {selectedShots.size > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">{selectedShots.size} selected</Badge>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          onClick={() => onPreselectRecommended(recommended)}
        >
          <Zap className="w-3 h-3" /> Auto-select
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        {onModelShots.length > 0 && (
          <Collapsible open={onModelOpen} onOpenChange={setOnModelOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-1 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">On-Model</span>
              <Badge variant="secondary" className="text-[9px] mr-1">{onModelShots.length}</Badge>
              <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', onModelOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {onModelShots.map(shot => (
                  <ShotCard
                    key={shot.id}
                    shot={shot}
                    isSelected={selectedShots.has(shot.id)}
                    isRecommended={recommendedSet.has(shot.id)}
                    onToggle={() => onToggleShot(shot.id)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {productOnlyShots.length > 0 && (
          <Collapsible open={productOnlyOpen} onOpenChange={setProductOnlyOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-1 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">Product-Only</span>
              <Badge variant="secondary" className="text-[9px] mr-1">{productOnlyShots.length}</Badge>
              <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', productOnlyOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {productOnlyShots.map(shot => (
                  <ShotCard
                    key={shot.id}
                    shot={shot}
                    isSelected={selectedShots.has(shot.id)}
                    isRecommended={recommendedSet.has(shot.id)}
                    onToggle={() => onToggleShot(shot.id)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </TooltipProvider>

      {/* Pinned credit calculator */}
      <div className="sticky bottom-4 z-10">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
            <Package className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            <span className="font-medium">{productCount} product{productCount !== 1 ? 's' : ''}</span>
            {modelCount > 0 && (
              <>
                <span className="text-muted-foreground">×</span>
                <span className="font-medium">{modelCount} model{modelCount !== 1 ? 's' : ''}</span>
              </>
            )}
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">{selectedShots.size} shot{selectedShots.size !== 1 ? 's' : ''}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">4 cr</span>
            <span className="text-muted-foreground">=</span>
            <span className="font-bold text-foreground">{totalCredits} credits</span>
            <span className="text-[10px] text-muted-foreground">({totalImages} images)</span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={onNext} disabled={!canProceed || selectedShots.size === 0} size="pill" className="gap-2">
              Next: Props <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShotCard({ shot, isSelected, isRecommended, onToggle }: {
  shot: ShotDefinition; isSelected: boolean; isRecommended: boolean; onToggle: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          className={cn(
            'relative rounded-xl border p-3.5 text-left transition-all duration-150 group',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            isSelected
              ? 'border-primary ring-2 ring-primary/20 bg-card'
              : 'border-border hover:border-primary/30 bg-card hover:shadow-sm',
          )}
        >
          {isSelected && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-foreground">{shot.label}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {shot.needsModel ? 'On-model' : 'Product only'}
            </p>
            {isRecommended && !isSelected && (
              <Badge variant="secondary" className="text-[8px] h-4 px-1.5 mt-1">
                <Sparkles className="w-2 h-2 mr-0.5" /> Recommended
              </Badge>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="text-xs">{shot.label} — {shot.needsModel ? 'requires model' : 'product-only shot'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
