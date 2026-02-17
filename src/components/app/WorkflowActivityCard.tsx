import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, XCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BatchGroup } from '@/lib/batchGrouping';

interface WorkflowActivityCardProps {
  batchGroups: BatchGroup[];
  completedGroups?: BatchGroup[];
  failedGroups?: BatchGroup[];
  onCancelJob?: (jobId: string, creditsReserved: number) => void;
}

function elapsedLabel(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function isStuck(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() > 3 * 60 * 1000; // 3 minutes
}

export function WorkflowActivityCard({
  batchGroups,
  completedGroups = [],
  failedGroups = [],
  onCancelJob,
}: WorkflowActivityCardProps) {
  const navigate = useNavigate();
  const [, tick] = useState(0);

  const hasActiveGroups = batchGroups.some((g) => g.processingCount > 0 || g.queuedCount > 0);

  useEffect(() => {
    if (!hasActiveGroups) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [hasActiveGroups]);

  const hasContent = batchGroups.length > 0 || completedGroups.length > 0 || failedGroups.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      <p className="section-label">Activity</p>

      {/* Active / in-progress batch groups */}
      {batchGroups.map((group) => {
        const isBatch = group.totalCount > 1;
        const progressPct = isBatch
          ? Math.round((group.completedCount / group.totalCount) * 100)
          : 0;
        const isProcessing = group.processingCount > 0;
        const elapsed = elapsedLabel(
          group.jobs.find((j) => j.started_at)?.started_at ?? group.created_at,
        );

        // Check if any processing job in this group is stuck (>3 min)
        const stuckJobs = group.jobs.filter(
          (j) => j.status === 'processing' && isStuck(j.started_at),
        );
        const hasStuckJobs = stuckJobs.length > 0;

        return (
          <Card key={group.key} className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="py-4 px-5 space-y-2">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                  {isProcessing ? (
                    <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />
                  ) : (
                    <Clock className="w-4.5 h-4.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {group.workflow_name ?? 'Workflow generation'}
                    {group.product_name ? ` — ${group.product_name}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isBatch ? (
                      <>
                        {group.completedCount} of {group.totalCount} batches complete · {elapsed}
                      </>
                    ) : isProcessing ? (
                      <>Generating… {elapsed}</>
                    ) : (
                      <>Queued · waiting {elapsed}</>
                    )}
                  </p>
                  {isProcessing && (
                    <p className="text-[11px] text-muted-foreground/70">
                      Pro model — est. ~60-120s per image
                      {isBatch && group.totalCount > 1 && ` · ~${Math.ceil(group.totalCount * 1)}-${Math.ceil(group.totalCount * 2)} min total`}
                    </p>
                  )}
                </div>
                {hasStuckJobs && onCancelJob && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      // Cancel all stuck processing jobs in this group
                      stuckJobs.forEach((j) =>
                        onCancelJob(j.id, j.credits_reserved ?? 0),
                      );
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                )}
                {isProcessing && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] uppercase tracking-wider font-semibold bg-violet-100 text-violet-700 hover:bg-violet-100"
                  >
                    Pro Model
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] uppercase tracking-wider font-semibold"
                >
                  {isProcessing ? 'Processing' : 'Queued'}
                </Badge>
              </div>

              {isBatch && (
                <Progress value={progressPct} className="h-1.5" />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Recently completed groups (green, "just finished") */}
      {completedGroups.map((group) => {
        const isBatch = group.totalCount > 1;

        return (
          <Card key={group.key} className="border-emerald-500/20 bg-emerald-500/[0.04]">
            <CardContent className="flex items-center gap-4 py-4 px-5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {group.workflow_name ?? 'Workflow generation'}
                  {group.product_name ? ` — ${group.product_name}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isBatch
                    ? `All ${group.totalCount} batches complete`
                    : 'Generation complete'}
                  {' · images ready'}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
              >
                Completed
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 gap-1.5"
                onClick={() => navigate('/app/library')}
              >
                View Results
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Failed groups (red) */}
      {failedGroups.map((group) => (
        <Card key={group.key} className="border-destructive/20 bg-destructive/[0.04]">
          <CardContent className="flex items-center gap-4 py-4 px-5">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-destructive/10 shrink-0">
              <XCircle className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {group.workflow_name ?? 'Workflow generation'}
                {group.product_name ? ` — ${group.product_name}` : ''}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {group.totalCount > 1
                  ? `${group.failedCount} of ${group.totalCount} batches failed`
                  : 'Generation failed'}
                {group.jobs[0]?.error_message
                  ? ` · ${group.jobs[0].error_message.slice(0, 60)}`
                  : ''}
              </p>
            </div>
            <Badge
              variant="destructive"
              className="shrink-0 text-[10px] uppercase tracking-wider font-semibold"
            >
              Failed
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5"
              onClick={() =>
                navigate(
                  `/app/generate${group.workflow_id ? `?workflow=${group.workflow_id}` : ''}`,
                )
              }
            >
              Retry
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
