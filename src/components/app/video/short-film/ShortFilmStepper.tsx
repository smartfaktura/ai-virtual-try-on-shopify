import { cn } from '@/lib/utils';
import { Check, Film, Image, BookOpen, LayoutGrid, Settings, Play } from 'lucide-react';
import type { ShortFilmStep } from '@/types/shortFilm';

const STEP_CONFIG: Record<ShortFilmStep, { label: string; icon: typeof Film }> = {
  film_type: { label: 'Film Type', icon: Film },
  references: { label: 'References', icon: Image },
  story: { label: 'Story', icon: BookOpen },
  shot_plan: { label: 'Shot Plan', icon: LayoutGrid },
  settings: { label: 'Settings', icon: Settings },
  review: { label: 'Review', icon: Play },
};

interface ShortFilmStepperProps {
  steps: ShortFilmStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  canNavigateTo?: (index: number) => boolean;
}

export function ShortFilmStepper({ steps, currentStepIndex, onStepClick, canNavigateTo }: ShortFilmStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between w-full">
        {steps.map((s, i) => {
          const isActive = currentStepIndex === i;
          const isDone = currentStepIndex > i;
          const canClick = canNavigateTo ? canNavigateTo(i) : isDone;
          const config = STEP_CONFIG[s];
          const Icon = config.icon;

          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => canClick && onStepClick?.(i)}
                disabled={!canClick}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-150 flex-shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
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
                <span className="text-[11px] font-medium tracking-wide hidden md:inline">{config.label}</span>
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
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const isActive = currentStepIndex === i;
            const isDone = currentStepIndex > i;
            const canClick = canNavigateTo ? canNavigateTo(i) : isDone;
            const config = STEP_CONFIG[s];
            const Icon = config.icon;

            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => canClick && onStepClick?.(i)}
                  disabled={!canClick}
                  className={cn(
                    'flex flex-col items-center gap-0.5 mx-auto rounded-full',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    !canClick && 'opacity-50 cursor-default',
                  )}
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
                  {isActive && (
                    <span className="text-[8px] font-semibold text-primary truncate max-w-[48px] text-center">
                      {config.label}
                    </span>
                  )}
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
        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
