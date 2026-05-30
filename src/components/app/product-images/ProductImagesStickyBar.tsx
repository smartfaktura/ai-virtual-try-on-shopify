import { Button } from '@/components/ui/button';
import { Coins, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
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
  blockedReason?: string | null;
  onNext: () => void;
  onBack: () => void;
}

const TOTAL_STEPS = 4;

export function ProductImagesStickyBar({ step, productCount, sceneCount, totalImages, totalCredits, balance, canProceed, blockedReason, onNext, onBack }: StickyBarProps) {
  const canAfford = balance >= totalCredits;
  const backDisabled = step <= 1;
  const showCredits = totalCredits > 0;

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

  const handleClick = () => {
    if (!canProceed) {
      toast(blockedReason ?? 'Finish this step to continue', { duration: 2600 });
      return;
    }
    onNext();
  };

  const blockedClass = !canProceed ? 'opacity-50 cursor-not-allowed hover:bg-primary' : '';

  return (
    <div className="sticky bottom-4 z-10 max-w-full min-w-0 overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg max-w-full overflow-hidden">
        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-2 p-3 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
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
              <span key={`m-${step}`} className="text-[10px] font-medium text-muted-foreground min-w-[48px]">
                {STEP_LABELS[step]}
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 flex-shrink-0 ${showCredits ? '' : 'invisible'}`}
              aria-hidden={!showCredits}
            >
              <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">
                <Coins className="w-3 h-3 text-primary" />
                <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
              </div>
              {showCredits && !canAfford && <span className="text-[10px] text-destructive font-medium">Not enough</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="pill"
              className="flex-shrink-0"
              onClick={onBack}
              disabled={backDisabled}
              aria-disabled={backDisabled}
            >
              Back
            </Button>
            <Button size="pill" onClick={handleClick} aria-disabled={!canProceed} className={`gap-1.5 flex-1 ${blockedClass}`}>
              {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
              {ctaLabel}
              {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-primary scale-125' : s < step ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span key={`d-${step}`} className="text-[10px] font-medium text-muted-foreground min-w-[56px] flex-shrink-0">
              {STEP_LABELS[step]}
            </span>

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

          <div
            className={`flex items-center gap-2 ${showCredits ? '' : 'invisible'}`}
            aria-hidden={!showCredits}
          >
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
              <span className="text-muted-foreground">cr</span>
            </div>
            {showCredits && !canAfford && <span className="text-xs text-destructive font-medium">Not enough credits</span>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="pill"
              onClick={onBack}
              disabled={backDisabled}
              aria-disabled={backDisabled}
            >
              Back
            </Button>
            <Button size="pill" onClick={handleClick} aria-disabled={!canProceed} className={`gap-1.5 ${blockedClass}`}>
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
