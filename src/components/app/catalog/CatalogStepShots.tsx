import { useMemo } from 'react';
import { getCompatibleShots, getRecommendedShotIds } from '@/lib/catalogEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, Sparkles, Camera, Package, Check, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductCategory, CatalogShotId, ShotDefinition } from '@/types/catalog';

interface CatalogStepShotsProps {
  productCategory: ProductCategory;
  hasModel: boolean;
  selectedShots: Set<CatalogShotId>;
  onToggleShot: (id: CatalogShotId) => void;
  onBack: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  totalImages: number;
  totalCredits: number;
  balance: number;
  onOpenBuyModal: () => void;
  onPreselectRecommended: (ids: CatalogShotId[]) => void;
}

export function CatalogStepShots({
  productCategory, hasModel, selectedShots, onToggleShot,
  onBack, onGenerate, canGenerate, isGenerating,
  totalImages, totalCredits, balance, onOpenBuyModal,
  onPreselectRecommended,
}: CatalogStepShotsProps) {
  const compatible = useMemo(() => getCompatibleShots(productCategory, hasModel), [productCategory, hasModel]);
  const allShots = useMemo(() => {
    const all = [...compatible];
    // Also include incompatible shots (greyed out) for awareness
    return all;
  }, [compatible]);
  const recommended = useMemo(() => getRecommendedShotIds(productCategory, hasModel), [productCategory, hasModel]);

  const onModelShots = allShots.filter(s => s.group === 'on-model');
  const productOnlyShots = allShots.filter(s => s.group === 'product-only');

  const hasEnoughCredits = balance >= totalCredits;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Select Shots</h3>
          <Badge variant="secondary" className="text-[10px]">{selectedShots.size} selected</Badge>
          <span className="text-xs text-muted-foreground ml-1">Choose the angles and views for your set</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => onPreselectRecommended(recommended)}
        >
          Auto-select recommended
        </Button>
      </div>

      <TooltipProvider delayDuration={200}>
        {/* On-Model Shots */}
        {onModelShots.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">On-Model Shots</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {onModelShots.map(shot => (
                <ShotCard key={shot.id} shot={shot} isSelected={selectedShots.has(shot.id)} onToggle={() => onToggleShot(shot.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Product-Only Shots */}
        {productOnlyShots.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product-Only Shots</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {productOnlyShots.map(shot => (
                <ShotCard key={shot.id} shot={shot} isSelected={selectedShots.has(shot.id)} onToggle={() => onToggleShot(shot.id)} />
              ))}
            </div>
          </div>
        )}
      </TooltipProvider>

      {/* Credit summary + generate */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{totalImages} images</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">4 credits each</span>
            <span className="text-muted-foreground">=</span>
            <span className="font-bold">{totalCredits} credits</span>
          </div>
          {hasEnoughCredits ? (
            <span className="text-sm text-muted-foreground">{balance} available</span>
          ) : (
            <button onClick={onOpenBuyModal} className="text-sm text-destructive font-semibold hover:underline flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" />
              {balance} available — need {totalCredits - balance} more
            </button>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={hasEnoughCredits ? onGenerate : onOpenBuyModal}
            disabled={!canGenerate || isGenerating || selectedShots.size === 0}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {hasEnoughCredits ? `Generate ${totalImages} Images` : 'Buy Credits'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShotCard({ shot, isSelected, onToggle }: { shot: ShotDefinition; isSelected: boolean; onToggle: () => void }) {
  const iconMap: Record<string, string> = {
    'on-model': '👤',
    'product-only': '📦',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          className={cn(
            'relative rounded-lg border-2 p-3 text-left transition-all',
            isSelected
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border hover:border-primary/40 bg-card hover:bg-muted/50',
          )}
        >
          {isSelected && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{iconMap[shot.group]}</span>
              <p className="text-xs font-semibold text-foreground">{shot.label}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {shot.needsModel ? 'On-model' : 'Product only'}
              {shot.defaultRenderPath === 'anchor_edit' && ' · Edit'}
              {shot.defaultRenderPath === 'reference_generate' && ' · Ref gen'}
            </p>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="text-xs">{shot.label} — {shot.needsModel ? 'requires model' : 'product-only shot'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
