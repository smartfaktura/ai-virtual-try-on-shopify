import { cn } from '@/lib/utils';
import { getMotionGoalsForCategory, type MotionGoal } from '@/lib/videoMotionRecipes';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface MotionGoalSelectorProps {
  category: string;
  selectedGoalId: string;
  onChange: (goalId: string) => void;
  recommendedGoalIds?: string[];
}

export function MotionGoalSelector({ category, selectedGoalId, onChange, recommendedGoalIds = [] }: MotionGoalSelectorProps) {
  const goals = getMotionGoalsForCategory(category);
  const topRecommended = recommendedGoalIds[0];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">Recommended Motion</h3>
      <div className="grid gap-2">
        {goals.map((goal) => {
          const isRecommended = topRecommended === goal.id;
          const isSelected = selectedGoalId === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => onChange(goal.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', isSelected ? 'text-foreground' : 'text-foreground/80')}>
                  {goal.title}
                </span>
                {isRecommended && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
