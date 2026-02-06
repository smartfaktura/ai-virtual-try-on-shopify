import { Badge } from '@/components/ui/badge';
import type { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
  queued: { variant: 'secondary', label: 'Queued', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  generating: { variant: 'secondary', label: 'Generating', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 animate-pulse' },
  completed: { variant: 'secondary', label: 'Completed', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
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
