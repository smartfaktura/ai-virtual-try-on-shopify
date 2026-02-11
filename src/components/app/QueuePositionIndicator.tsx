import { Loader2, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { QueueJob } from '@/hooks/useGenerationQueue';

interface QueuePositionIndicatorProps {
  job: QueueJob;
  onCancel?: () => void;
}

export function QueuePositionIndicator({ job, onCancel }: QueuePositionIndicatorProps) {
  if (job.status === 'completed') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation complete!</p>
          <p className="text-xs text-muted-foreground">Your images are ready</p>
        </div>
      </div>
    );
  }

  if (job.status === 'failed') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        <XCircle className="w-5 h-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation failed</p>
          <p className="text-xs text-muted-foreground">{job.error_message || 'An error occurred. Credits have been refunded.'}</p>
        </div>
      </div>
    );
  }

  if (job.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
        <Ban className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generation cancelled</p>
          <p className="text-xs text-muted-foreground">Credits have been refunded</p>
        </div>
      </div>
    );
  }

  if (job.status === 'processing') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Generating your images…</p>
          <p className="text-xs text-muted-foreground">Usually takes a few seconds</p>
          <Progress value={50} className="mt-2 h-1.5" />
        </div>
      </div>
    );
  }

  // Queued
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {job.position === 0
            ? 'Your job is next in queue…'
            : `Your job is #${job.position + 1} in queue…`}
        </p>
        <p className="text-xs text-muted-foreground">
          Estimated wait: {job.position === 0 ? 'starting soon' : `~${Math.max(1, job.position)} min`}
        </p>
        <Progress value={10} className="mt-2 h-1.5" />
      </div>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="shrink-0 text-xs">
          Cancel
        </Button>
      )}
    </div>
  );
}
