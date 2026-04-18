import { Button } from '@/components/ui/button';
import { Coins, Sparkles, ArrowRight } from 'lucide-react';
import type { PIStep } from './types';

const STEP_LABELS: Record<number, string> = {
  1: 'Product',
  2: 'Shots',
  3: 'Setup',
  4: 'Generate',
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

const TOTAL_STEPS = 4;

export function ProductImagesStickyBar({ step, productCount, sceneCount, totalImages, totalCredits, balance, canProceed, onNext, onBack }: StickyBarProps) {
  const canAfford = balance >= totalCredits;

  const ctaLabel = (() => {
    switch (step) {
      case 1: return 'Next: Choose Shots';
      case 2: return 'Continue';
      case 3: return 'Review';
      case 4: return `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`;
      default: return 'Continue';
    }
  })();

  const showGenIcon = step === 4;

  return (
    <div className="sticky bottom-4 z-10">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg">
        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-2 p-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
                  <div
                    key={s}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      s === step ? 'bg-primary scale-125' : s < step ? 'bg-primary/40' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{STEP_LABELS[step]}</span>
            </div>
          {totalCredits > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">
                <Coins className="w-3 h-3 text-primary" />
                <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
              </div>
              {!canAfford && <span className="text-[10px] text-destructive font-medium">Not enough</span>}
            </div>
          )}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && step <= 4 && (
              <Button variant="outline" className="flex-shrink-0" onClick={onBack}>Back</Button>
            )}
            <Button size="pill" disabled={!canProceed} onClick={onNext} className="gap-1.5 flex-1">
              {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
              {ctaLabel}
              {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-primary scale-125' : s < step ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{STEP_LABELS[step]}</span>

            <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
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

        {totalCredits > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
                <span className="text-muted-foreground">cr</span>
              </div>
              {!canAfford && <span className="text-xs text-destructive font-medium">Not enough credits</span>}
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {step > 1 && step <= 4 && (
              <Button variant="outline" onClick={onBack}>Back</Button>
            )}
            <Button size="pill" disabled={!canProceed} onClick={onNext} className="gap-1.5">
              {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
              {ctaLabel}
              {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
