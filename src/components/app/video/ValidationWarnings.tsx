import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
}

interface ValidationWarningsProps {
  warnings: ValidationWarning[];
}

export function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  if (!warnings.length) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-2 px-3 py-2 rounded-lg text-sm',
            w.type === 'error' && 'bg-destructive/10 text-destructive',
            w.type === 'warning' && 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
            w.type === 'info' && 'bg-muted text-muted-foreground'
          )}
        >
          {w.type === 'info' ? (
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
