import { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
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
  nextDisabled?: boolean;
  isLastStep?: boolean;
  children: ReactNode;
}

const STEPS_WIZARD = [
  { n: 0, label: "Source" },
  { n: 1, label: "Family" },
  { n: 2, label: "Sub-family" },
  { n: 3, label: "Aesthetic" },
  { n: 4, label: "Cast" },
  { n: 5, label: "Details" },
  { n: 6, label: "Preview" },
  { n: 7, label: "Review" },
] as const;

// Reference path skips Step 5 (category details).
const STEPS_REFERENCE = [
  { n: 0, label: "Source" },
  { n: 1, label: "Family" },
  { n: 2, label: "Sub-family" },
  { n: 3, label: "Reference" },
  { n: 4, label: "Cast" },
  { n: 6, label: "Preview" },
  { n: 7, label: "Review" },
] as const;

export function WizardLayout({
  step,
  source,
  title,
  subtitle,
  onBack,
  onNext,
  nextDisabled,
  isLastStep,
  children,
}: Props) {
  const steps = source === "reference" ? STEPS_REFERENCE : STEPS_WIZARD;
  const total = steps.length;
  const currentIdx = steps.findIndex((s) => s.n === step);
  const displayIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Lock className="w-3 h-3" />
        Admin preview — Brand Scenes wizard
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={[
                "h-1 flex-1 rounded-full transition-colors",
                i <= displayIdx ? "bg-foreground" : "bg-border",
              ].join(" ")}
            />
            {i === steps.length - 1 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {displayIdx + 1}/{total}
              </span>
            )}
          </div>
        ))}
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

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={step === 0}
          className="rounded-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {isLastStep ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button disabled className="rounded-full font-semibold gap-2">
                    Save scene
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Available in a later phase</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-full font-semibold gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
