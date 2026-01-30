import { Badge, type BadgeProps } from '@shopify/polaris';
import type { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { tone: BadgeProps['tone']; label: string }> = {
  queued: { tone: 'info', label: 'Queued' },
  generating: { tone: 'attention', label: 'Generating' },
  completed: { tone: 'success', label: 'Completed' },
  failed: { tone: 'critical', label: 'Failed' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge tone={config.tone} progress={status === 'generating' ? 'partiallyComplete' : undefined}>
      {config.label}
    </Badge>
  );
}
