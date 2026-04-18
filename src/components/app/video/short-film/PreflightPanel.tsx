import { CheckCircle2, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreflightResult } from '@/lib/commerceVideo/preflight';

interface Props {
  result: PreflightResult;
}

export function PreflightPanel({ result }: Props) {
  const { score, errors, warnings, suggestions, passed } = result;

  const grade =
    score >= 85 ? 'Excellent'
    : score >= 70 ? 'Strong'
    : score >= 50 ? 'Acceptable'
    : 'Needs work';

  const ringColor =
    score >= 70 ? 'text-foreground'
    : score >= 50 ? 'text-muted-foreground'
    : 'text-destructive';

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Pre-flight check</div>
          <div className="text-xs text-muted-foreground">
            {passed
              ? 'Ready to generate. Review warnings below for max quality.'
              : 'Fix the errors below before generating.'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('text-2xl font-semibold tabular-nums', ringColor)}>{score}</div>
          <div className="text-xs text-muted-foreground">/ 100<br />{grade}</div>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1.5">
          {errors.map(e => (
            <li key={e.id} className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{e.message}</span>
            </li>
          ))}
        </ul>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1.5">
          {warnings.map(w => (
            <li key={w.id} className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span>{w.message}</span>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <ul className="space-y-1.5">
          {suggestions.map(s => (
            <li key={s.id} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{s.message}</span>
            </li>
          ))}
        </ul>
      )}

      {errors.length === 0 && warnings.length === 0 && suggestions.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Everything checks out — go for it.
        </div>
      )}
    </div>
  );
}
