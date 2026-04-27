import { cn } from '@/lib/utils';
import { TRANSITION_GOALS } from '@/lib/transitionMotionRecipes';

interface TransitionGoalSelectorProps {
  selectedGoalId: string;
  onChange: (goalId: string) => void;
}

export function TransitionGoalSelector({ selectedGoalId, onChange }: TransitionGoalSelectorProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">Transition Goal</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {TRANSITION_GOALS.map((goal) => {
          const selected = goal.id === selectedGoalId;
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onChange(goal.id)}
              className={cn(
                'text-left rounded-lg border p-3 transition-all min-h-[88px]',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="text-sm font-medium text-foreground leading-snug">{goal.title}</div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{goal.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
