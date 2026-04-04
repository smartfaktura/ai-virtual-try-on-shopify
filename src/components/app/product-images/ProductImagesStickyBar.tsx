import { Button } from '@/components/ui/button';
import { Coins, Sparkles, ArrowRight } from 'lucide-react';
import type { PIStep } from './types';

const STEP_LABELS: Record<number, string> = {
  1: 'Products',
  2: 'Scenes',
  3: 'Refine',
  4: 'Settings',
  5: 'Review',
};

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
      case 2: return 'Refine';
      case 3: return 'Settings';
      case 4: return 'Review';
      case 5: return `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`;
      default: return 'Continue';
    }
  })();

  const showGenIcon = step === 5;

  return (
    <div className="sticky bottom-4 z-10">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3">
        {/* Left: Progress dots + summary */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Step dots */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step
                    ? 'bg-primary scale-125'
                    : s < step
                      ? 'bg-primary/40'
                      : 'bg-border'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">{STEP_LABELS[step]}</span>

          {/* Compact summary */}
          <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:flex items-center gap-1">
            {productCount > 0 && <span className="font-medium text-foreground">{productCount} product{productCount !== 1 ? 's' : ''}</span>}
            {sceneCount > 0 && (
              <>
                <span>·</span>
                <span className="font-medium text-foreground">{sceneCount} scene{sceneCount !== 1 ? 's' : ''}</span>
              </>
            )}
            {totalImages > 0 && (
              <>
                <span>·</span>
                <span className="font-bold text-foreground">{totalImages} img{totalImages !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Credits badge */}
        {totalCredits > 0 && (
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
            <span className="text-muted-foreground">cr</span>
          </div>
        )}

        {/* Buttons */}
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
