import { cn } from '@/lib/utils';
import { TRANSITION_GOALS } from '@/lib/transitionMotionRecipes';

interface TransitionGoalSelectorProps {
  selectedGoalId: string;
  onChange: (goalId: string) => void;
}

export function TransitionGoalSelector({ selectedGoalId, onChange }: TransitionGoalSelectorProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Transition Goal</h3>
        <p className="text-[11.5px] text-muted-foreground hidden sm:block">
          Pick the storytelling intent of the transition
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TRANSITION_GOALS.map((goal) => {
          const selected = goal.id === selectedGoalId;
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onChange(goal.id)}
              className={cn(
                'text-left rounded-xl border p-3.5 min-h-[96px] transition-all duration-200',
                'hover:shadow-sm hover:-translate-y-px',
                selected
                  ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/20 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="text-sm font-semibold text-foreground leading-snug">{goal.title}</div>
              <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">{goal.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
