import { Button } from '@/components/ui/button';
import { Coins, Sparkles, ArrowRight } from 'lucide-react';
import type { PIStep } from './types';

interface StickyBarProps {
  step: PIStep;
  productCount: number;
  sceneCount: number;
  totalImages: number;
  totalCredits: number;
  balance: number;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function ProductImagesStickyBar({ step, productCount, sceneCount, totalImages, totalCredits, balance, canProceed, onNext, onBack }: StickyBarProps) {
  const canAfford = balance >= totalCredits;

  const ctaLabel = (() => {
    switch (step) {
      case 1: return 'Choose Scenes';
      case 2: return 'Settings';
      case 3: return 'Refine';
      case 4: return 'Review';
      case 5: return `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`;
      default: return 'Continue';
    }
  })();

  const showGenIcon = step === 5;

  return (
    <div className="sticky bottom-4 z-10">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg flex items-center justify-between gap-4">
        {/* Left: Summary */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground min-w-0">
          {productCount > 0 && (
            <span className="whitespace-nowrap">
              <span className="font-bold text-foreground">{productCount}</span> product{productCount !== 1 ? 's' : ''}
            </span>
          )}
          {sceneCount > 0 && (
            <>
              <span className="text-border font-medium">×</span>
              <span className="whitespace-nowrap">
                <span className="font-bold text-foreground">{sceneCount}</span> scene{sceneCount !== 1 ? 's' : ''}
              </span>
              <span className="text-border font-medium">=</span>
              <span className="font-bold text-foreground whitespace-nowrap">{totalImages} image{totalImages !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>

        {/* Center: Credits */}
        {totalCredits > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Coins className="w-4 h-4 text-primary" />
            <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
            <span className="text-muted-foreground text-xs">credits</span>
          </div>
        )}

        {/* Right: Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {step > 1 && step <= 5 && (
            <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
          )}
          <Button size="sm" disabled={!canProceed} onClick={onNext} className="gap-1.5">
            {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
            {ctaLabel}
            {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
