import { ReactNode, useRef } from "react";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WizardStep } from "./useWizardState";
import type { BrandSceneSource } from "../constants";

interface Props {
  step: WizardStep;
  source: BrandSceneSource;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onNext: () => void;
  onGoToStep?: (step: WizardStep) => void;
  nextDisabled?: boolean;
  nextDisabledReason?: string | null;
  isLastStep?: boolean;
  children: ReactNode;
}

const STEPS_WIZARD = [
  { n: 0 as WizardStep, label: "Source" },
  { n: 1 as WizardStep, label: "Family" },
  { n: 2 as WizardStep, label: "Sub-family" },
  { n: 3 as WizardStep, label: "Cast" },
  { n: 4 as WizardStep, label: "Environment" },
  { n: 5 as WizardStep, label: "Photo & edit" },
  { n: 6 as WizardStep, label: "Review" },
] as const;

const STEPS_REFERENCE = [
  { n: 0 as WizardStep, label: "Source" },
  { n: 1 as WizardStep, label: "Family" },
  { n: 2 as WizardStep, label: "Sub-family" },
  { n: 3 as WizardStep, label: "Reference" },
  { n: 4 as WizardStep, label: "Cast" },
  { n: 6 as WizardStep, label: "Review" },
] as const;

export function WizardLayout({
  step,
  source,
  title,
  subtitle,
  onBack,
  onNext,
  onGoToStep,
  nextDisabled,
  nextDisabledReason,
  isLastStep,
  children,
}: Props) {
  const steps = source === "reference" ? STEPS_REFERENCE : STEPS_WIZARD;
  const total = steps.length;
  const currentIdx = steps.findIndex((s) => s.n === step);
  const displayIdx = currentIdx >= 0 ? currentIdx : 0;
  const currentLabel = steps[displayIdx]?.label ?? "";
  const rootRef = useRef<HTMLDivElement>(null);

  const handleNextClick = () => {
    if (!nextDisabled) {
      onNext();
      return;
    }
    const target = rootRef.current?.querySelector<HTMLElement>(
      '[data-missing="1"]',
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const ctaLabel = isLastStep ? "Save scene" : "Next";
  const showGenIcon = false;

  const NextButton = (
    <Button
      size="pill"
      onClick={handleNextClick}
      aria-disabled={nextDisabled || undefined}
      disabled={isLastStep}
      className={["gap-1.5", nextDisabled ? "opacity-50 hover:opacity-50" : ""].join(" ")}
    >
      {showGenIcon && <Sparkles className="w-3.5 h-3.5" />}
      {ctaLabel}
      {!showGenIcon && !isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
    </Button>
  );

  return (
    <div ref={rootRef} className="max-w-3xl mx-auto space-y-8 pb-2">


      {/* Clickable step bars + labels */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const isPast = i < displayIdx;
            const isCurrent = i === displayIdx;
            const clickable = !!onGoToStep && i <= displayIdx;
            return (
              <button
                key={s.n}
                type="button"
                onClick={clickable ? () => onGoToStep!(s.n) : undefined}
                disabled={!clickable}
                aria-label={`Go to step ${i + 1}: ${s.label}`}
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "h-1 flex-1 rounded-full transition-colors outline-none",
                  isPast || isCurrent ? "bg-foreground" : "bg-border",
                  clickable
                    ? "hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40"
                    : "cursor-default",
                ].join(" ")}
              />
            );
          })}
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {displayIdx + 1}/{total}
          </span>
        </div>
        {/* Step labels (desktop) */}
        <div className="hidden sm:flex items-start gap-2 pr-10">
          {steps.map((s, i) => {
            const isCurrent = i === displayIdx;
            const clickable = !!onGoToStep && i <= displayIdx;
            return (
              <button
                key={s.n}
                type="button"
                onClick={clickable ? () => onGoToStep!(s.n) : undefined}
                disabled={!clickable}
                className={[
                  "flex-1 text-[10px] uppercase tracking-[0.14em] text-center truncate transition-colors",
                  isCurrent
                    ? "text-foreground font-medium"
                    : clickable
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/50 cursor-default",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-muted-foreground mt-1.5 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      <div className="min-h-[280px]">{children}</div>

      {/* Sticky bottom floating card — mirrors ProductImagesStickyBar */}
      <div className="sticky bottom-4 z-20 max-w-full min-w-0 overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg max-w-full overflow-hidden">
          {nextDisabled && nextDisabledReason && !isLastStep && (
            <div className="px-3 sm:px-4 pt-3 pb-0 flex">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground"
                data-testid="next-disabled-reason"
              >
                <Lock className="w-3 h-3" />
                {nextDisabledReason}
              </span>
            </div>
          )}

          {/* Mobile: stacked */}
          <div className="flex flex-col gap-2 p-3 sm:hidden">
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="pill"
                  className="flex-shrink-0"
                  onClick={onBack}
                >
                  Back
                </Button>
              )}
              {isLastStep ? null : nextDisabled && nextDisabledReason ? (
                <DisabledTooltip reason={nextDisabledReason}>
                  <span className="flex-1">{NextButton}</span>
                </DisabledTooltip>
              ) : (
                <span className="flex-1">{NextButton}</span>
              )}
            </div>
          </div>

          {/* Desktop: single row */}
          <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {currentLabel}
            </span>

            <div className="flex items-center gap-2 flex-shrink-0">
              {step > 0 && (
                <Button variant="outline" size="pill" onClick={onBack}>
                  Back
                </Button>
              )}
              {isLastStep ? null : nextDisabled && nextDisabledReason ? (
                <DisabledTooltip reason={nextDisabledReason}>
                  {NextButton}
                </DisabledTooltip>
              ) : (
                NextButton
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DisabledTooltip({ children, reason }: { children: ReactNode; reason: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
