import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StepDef {
  number: number;
  label: string;
  icon: LucideIcon;
}

interface CatalogStepperProps {
  steps: StepDef[];
  currentStep: number;
  canNavigateTo: (step: number) => boolean;
  onStepClick: (step: number) => void;
}

export function CatalogStepper({ steps, currentStep, canNavigateTo, onStepClick }: CatalogStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {steps.map((s, i) => {
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;
          const canClick = canNavigateTo(s.number);
          const Icon = s.icon;

          return (
            <div key={s.number} className="flex items-center">
              <button
                onClick={() => canClick && onStepClick(s.number)}
                disabled={!canClick}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full transition-all duration-150',
                  isActive && 'bg-primary text-primary-foreground shadow-sm',
                  isDone && !isActive && 'bg-primary/8 text-primary cursor-pointer hover:bg-primary/12',
                  !isActive && !isDone && canClick && 'text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60',
                  !isActive && !isDone && !canClick && 'text-muted-foreground/30 cursor-default',
                )}
              >
                <div className={cn(
                  'w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all flex-shrink-0',
                  isActive && 'bg-primary-foreground/20',
                  isDone && !isActive && 'bg-primary/15',
                  !isActive && !isDone && 'bg-muted',
                )}>
                  {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="text-[10px] font-medium tracking-wide hidden md:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  'w-3 lg:w-5 h-px mx-0.5 transition-colors duration-300',
                  isDone ? 'bg-primary/30' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper — compact */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((s, i) => {
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            const canClick = canNavigateTo(s.number);
            const Icon = s.icon;

            return (
              <div key={s.number} className="flex items-center">
                <button
                  onClick={() => canClick && onStepClick(s.number)}
                  disabled={!canClick}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150',
                    isActive && 'bg-primary text-primary-foreground',
                    isDone && !isActive && 'bg-primary/10 text-primary',
                    !isActive && !isDone && canClick && 'bg-muted text-muted-foreground',
                    !isActive && !isDone && !canClick && 'bg-muted/50 text-muted-foreground/30',
                  )}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn(
                    'text-[9px] font-medium',
                    isActive ? 'text-primary' : isDone ? 'text-primary/60' : 'text-muted-foreground/50',
                  )}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'w-4 h-px mx-0.5 -mt-3',
                    isDone ? 'bg-primary/30' : 'bg-border',
                  )} />
                )}
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-0.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
