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
      case 1: return 'Continue to Scenes';
      case 2: return 'Continue to Details';
      case 3: return 'Review Plan';
      case 4: return `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`;
      default: return 'Continue';
    }
  })();

  const showGenIcon = step === 4;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        {/* Left: Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground min-w-0">
          {productCount > 0 && (
            <span className="whitespace-nowrap">
              <span className="font-semibold text-foreground">{productCount}</span> product{productCount !== 1 ? 's' : ''}
            </span>
          )}
          {sceneCount > 0 && (
            <>
              <span className="text-border">×</span>
              <span className="whitespace-nowrap">
                <span className="font-semibold text-foreground">{sceneCount}</span> scene{sceneCount !== 1 ? 's' : ''}
              </span>
              <span className="text-border">=</span>
              <span className="font-semibold text-foreground whitespace-nowrap">{totalImages} image{totalImages !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>

        {/* Center: Credits */}
        {totalCredits > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className={`font-semibold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>{totalCredits}</span>
            <span className="text-muted-foreground">credits</span>
          </div>
        )}

        {/* Right: Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {step > 1 && step <= 4 && (
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
