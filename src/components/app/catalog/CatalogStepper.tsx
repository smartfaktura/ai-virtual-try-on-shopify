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
    <div className="w-full overflow-hidden">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between w-full">
        {steps.map((s, i) => {
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;
          const canClick = canNavigateTo(s.number);
          const Icon = s.icon;

          return (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => canClick && onStepClick(s.number)}
                disabled={!canClick}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-150 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  isActive && 'bg-primary text-primary-foreground shadow-sm',
                  isDone && !isActive && 'bg-primary/8 text-primary cursor-pointer hover:bg-primary/12',
                  !isActive && !isDone && canClick && 'text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60',
                  !isActive && !isDone && !canClick && 'text-muted-foreground/30 cursor-default',
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all flex-shrink-0',
                  isActive && 'bg-primary-foreground/20',
                  isDone && !isActive && 'bg-primary/15',
                  !isActive && !isDone && 'bg-muted',
                )}>
                  {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="text-[11px] font-medium tracking-wide hidden md:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-px mx-1 transition-colors duration-300 min-w-2',
                  isDone ? 'bg-primary/30' : 'bg-border',
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="sm:hidden overflow-hidden">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;
            const canClick = canNavigateTo(s.number);
            const Icon = s.icon;

            return (
              <div key={s.number} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => canClick && onStepClick(s.number)}
                  disabled={!canClick}
                  className={cn(
                    "flex flex-col items-center gap-1 mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                    !canClick && 'opacity-50 cursor-default',
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
                    isActive && 'bg-primary text-primary-foreground',
                    isDone && !isActive && 'bg-primary/10 text-primary',
                    !isActive && !isDone && canClick && 'bg-muted text-muted-foreground',
                    !isActive && !isDone && !canClick && 'bg-muted/50 text-muted-foreground/30',
                  )}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium text-center truncate max-w-[56px]',
                    isActive && 'text-primary font-semibold',
                    isDone && !isActive && 'text-primary/70',
                    !isActive && !isDone && 'text-muted-foreground',
                  )}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px mx-0.5 transition-colors',
                    isDone ? 'bg-primary/30' : 'bg-border',
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
