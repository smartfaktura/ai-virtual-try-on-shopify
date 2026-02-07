import { Badge } from '@/components/ui/badge';
import type { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
  queued: { variant: 'secondary', label: 'Queued', className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' },
  generating: { variant: 'secondary', label: 'Generating', className: 'bg-amber-50 text-amber-900 hover:bg-amber-50 animate-pulse' },
  completed: { variant: 'secondary', label: 'Completed', className: 'bg-slate-100 text-slate-800 hover:bg-slate-100' },
  failed: { variant: 'destructive', label: 'Failed' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
