import { cn } from '@/lib/utils';
import type { ShortFilmStep } from '@/types/shortFilm';

const STEP_LABELS: Record<string, string> = {
  film_type: 'Film Type',
  references: 'References',
  story: 'Story',
  shot_plan: 'Shot Plan',
  settings: 'Settings',
  review: 'Review',
};

interface ShortFilmStepperProps {
  steps: ShortFilmStep[];
  currentStepIndex: number;
}

export function ShortFilmStepper({ steps, currentStepIndex }: ShortFilmStepperProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div
            className={cn(
              'flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all shrink-0',
              i < currentStepIndex && 'bg-primary text-primary-foreground',
              i === currentStepIndex && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
              i > currentStepIndex && 'bg-muted text-muted-foreground'
            )}
          >
            {i + 1}
          </div>
          <span className={cn(
            'text-xs font-medium hidden sm:block truncate',
            i === currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {STEP_LABELS[s]}
          </span>
          {i < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-px mx-1',
              i < currentStepIndex ? 'bg-primary' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
