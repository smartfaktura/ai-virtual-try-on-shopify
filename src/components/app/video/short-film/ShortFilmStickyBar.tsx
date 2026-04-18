import { Button } from '@/components/ui/button';
import { Coins, Sparkles, ArrowRight, ArrowLeft, RotateCcw, Save, Download, Film } from 'lucide-react';
import type { ShortFilmStep } from '@/types/shortFilm';

const STEP_LABELS: Record<ShortFilmStep, string> = {
  film_type: 'Film Type',
  content_intent: 'Intent',
  references: 'References',
  story: 'Story',
  shot_plan: 'Shot Plan',
  settings: 'Settings',
  review: 'Review',
};

const CTA_LABELS: Record<ShortFilmStep, string> = {
  film_type: 'Next: Content Intent',
  content_intent: 'Next: Add References',
  references: 'Next: Story Structure',
  story: 'Next: Shot Plan',
  shot_plan: 'Next: Settings',
  settings: 'Review Film',
  review: 'Generate Short Film',
};

interface ShortFilmStickyBarProps {
  step: ShortFilmStep;
  steps: ShortFilmStep[];
  currentStepIndex: number;
  totalCredits: number;
  shotCount: number;
  canAdvance: boolean;
  isGenerating: boolean;
  allDone: boolean;
  hasCompletedClips: boolean;
  onNext: () => void;
  onBack: () => void;
  onGenerate: () => void;
  onReset: () => void;
  onSaveDraft: () => void;
  onDownloadAll: () => void;
}

export function ShortFilmStickyBar({
  step, steps, currentStepIndex, totalCredits, shotCount,
  canAdvance, isGenerating, allDone, hasCompletedClips,
  onNext, onBack, onGenerate, onReset, onSaveDraft, onDownloadAll,
}: ShortFilmStickyBarProps) {
  const totalSteps = steps.length;

  const ctaLabel = (() => {
    if (allDone) return null;
    return CTA_LABELS[step] || 'Continue';
  })();

  const showGenIcon = step === 'review' && !allDone;
  const showSaveDraft = currentStepIndex >= 1 && step !== 'review';
  const canAfford = true; // credits checked at generation time

  return (
    <div className="sticky bottom-4 z-10">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg">
        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-2 p-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {steps.map((s, i) => (
                  <div
                    key={s}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentStepIndex ? 'bg-primary scale-125' : i < currentStepIndex ? 'bg-primary/40' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{STEP_LABELS[step]}</span>
            </div>
            {totalCredits > 0 && shotCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">
                <Coins className="w-3 h-3 text-primary" />
                <span className="font-bold text-foreground">{totalCredits}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && !allDone && (
              <Button variant="outline" size="pill" className="flex-shrink-0" onClick={onBack}>Back</Button>
            )}
            {allDone ? (
              <div className="flex items-center gap-2 flex-1">
                <Button variant="outline" className="gap-1.5 flex-1" onClick={onReset}>
                  <Film className="w-3.5 h-3.5" /> New Film
                </Button>
                {hasCompletedClips && (
                  <Button variant="outline" className="gap-1.5 flex-1" onClick={onDownloadAll}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                )}
              </div>
            ) : ctaLabel ? (
              <Button
                size="pill"
                disabled={step === 'review' ? isGenerating : !canAdvance}
                onClick={step === 'review' ? onGenerate : onNext}
                className="gap-1.5 flex-1"
              >
                {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
                {ctaLabel}
                {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStepIndex ? 'bg-primary scale-125' : i < currentStepIndex ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{STEP_LABELS[step]}</span>

            <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
              {shotCount > 0 && <span className="font-medium text-foreground">{shotCount} shot{shotCount !== 1 ? 's' : ''}</span>}
            </div>
          </div>

          {totalCredits > 0 && shotCount > 0 && (
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-foreground">{totalCredits}</span>
              <span className="text-muted-foreground">cr</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentStepIndex > 0 && !allDone && (
              <>
                <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                {showSaveDraft && (
                  <Button variant="ghost" size="sm" onClick={onSaveDraft} className="gap-1 text-muted-foreground">
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                )}
                <Button variant="outline" size="pill" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </>
            )}
            {allDone ? (
              <>
                <Button variant="outline" className="gap-1.5" onClick={onReset}>
                  <Film className="w-3.5 h-3.5" /> New Film
                </Button>
                {hasCompletedClips && (
                  <Button size="pill" className="gap-1.5" onClick={onDownloadAll}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                )}
              </>
            ) : ctaLabel ? (
              <Button
                size="pill"
                disabled={step === 'review' ? isGenerating : !canAdvance}
                onClick={step === 'review' ? onGenerate : onNext}
                className="gap-1.5"
              >
                {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
                {ctaLabel}
                {!showGenIcon && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
