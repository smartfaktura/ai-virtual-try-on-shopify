import { ReactNode, useRef } from "react";
import { ArrowRight } from "lucide-react";
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
  nextLabel?: string;
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
  nextLabel,
  isLastStep,
  children,
}: Props) {
  const steps = source === "reference" ? STEPS_REFERENCE : STEPS_WIZARD;
  const total = steps.length;
  const currentIdx = steps.findIndex((s) => s.n === step);
  const displayIdx = currentIdx >= 0 ? currentIdx : 0;
  const currentLabel = steps[displayIdx]?.label ?? "";
  const rootRef = useRef<HTMLDivElement>(null);
  const progressPct = ((displayIdx + 1) / total) * 100;
  const stepNum = String(displayIdx + 1).padStart(2, "0");

  const handleNextClick = () => {
    if (!nextDisabled) {
      onNext();
      return;
    }
    const target = rootRef.current?.querySelector<HTMLElement>('[data-missing="1"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const ctaLabel = isLastStep ? "Save scene" : (nextLabel ?? "Next");

  const NextButton = (
    <Button
      size="pill"
      onClick={handleNextClick}
      aria-disabled={nextDisabled || undefined}
      disabled={isLastStep}
      className={["gap-1.5", nextDisabled ? "opacity-50 hover:opacity-50" : ""].join(" ")}
    >
      {ctaLabel}
      {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
    </Button>
  );

  return (
    <div ref={rootRef} className="max-w-2xl mx-auto w-full">
      {/* Quiet progress track */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={
            onGoToStep && displayIdx > 0
              ? () => onGoToStep(steps[displayIdx - 1].n)
              : undefined
          }
          aria-label="Progress"
          className="block w-full h-0.5 bg-border rounded-full overflow-hidden cursor-default"
        >
          <div
            className="h-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </button>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="tabular-nums">
            {stepNum} <span className="text-muted-foreground/50">/ {String(total).padStart(2, "0")}</span>
          </span>
          <span>{currentLabel}</span>
        </div>
      </div>

      {/* Question block */}
      <div key={step} className="animate-fade-in pt-12 pb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}

        <div className="mt-10">{children}</div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-20 pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
            <span className="text-[11px] text-muted-foreground/80 truncate">
              {nextDisabled && nextDisabledReason ? nextDisabledReason : ""}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {step > 0 && (
                <Button variant="outline" size="pill" onClick={onBack}>
                  Back
                </Button>
              )}
              {isLastStep ? null : nextDisabled && nextDisabledReason ? (
                <DisabledTooltip reason={nextDisabledReason}>{NextButton}</DisabledTooltip>
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
