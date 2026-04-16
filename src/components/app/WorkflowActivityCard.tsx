import React, { useMemo } from 'react';
import { useVisibilityTick } from '@/hooks/useVisibilityTick';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, XCircle, CheckCircle2, Clock, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS, getRandomStatusMessage } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { BatchGroup } from '@/lib/batchGrouping';

function elapsedLabel(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Self-ticking elapsed timer — isolates 1s re-renders to just this text node */
function ElapsedTimer({ startedAt, enabled }: { startedAt: string; enabled: boolean }) {
  useVisibilityTick(1000, enabled);
  return <>{elapsedLabel(startedAt)}</>;
}

function isStuck(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() > 3 * 60 * 1000;
}

/** Pick 2-3 deterministic team members for a group key */
function pickTeamForGroup(groupKey: string): typeof TEAM_MEMBERS {
  let hash = 0;
  for (let i = 0; i < groupKey.length; i++) {
    hash = (hash << 5) - hash + groupKey.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % TEAM_MEMBERS.length;
  return [
    TEAM_MEMBERS[idx],
    TEAM_MEMBERS[(idx + 3) % TEAM_MEMBERS.length],
    TEAM_MEMBERS[(idx + 7) % TEAM_MEMBERS.length],
  ];
}

/** Count unique product names in a batch group */
function uniqueProductCount(group: BatchGroup): number {
  const names = new Set(group.jobs.map((j) => j.product_name).filter(Boolean));
  return names.size;
}

interface WorkflowActivityCardProps {
  batchGroups: BatchGroup[];
  completedGroups?: BatchGroup[];
  failedGroups?: BatchGroup[];
  onCancelJob?: (jobId: string, creditsReserved: number) => void;
  onDismiss?: (groupKey: string) => void;
}

const ActiveGroupCard = React.memo(function ActiveGroupCard({
  group,
  onCancelJob,
}: {
  group: BatchGroup;
  onCancelJob?: (jobId: string, creditsReserved: number) => void;
}) {
  const navigate = useNavigate();
  const hasMultipleImages = group.totalImageCount > 1;
  const rawPct = hasMultipleImages ? Math.round((group.generatedImageCount / group.totalImageCount) * 100) : 0;
  const isProcessing = group.processingCount > 0;
  const startedAt = group.jobs.find((j) => j.started_at)?.started_at ?? group.created_at;

  // Time-based floor: crawl to 15% max so bar never shows 0%
  const elapsedSec = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const estTotal = Math.max(group.totalImageCount * 45, 1);
  const timeFloor = Math.min((elapsedSec / estTotal) * 15, 15);
  const progressPct = isProcessing ? Math.max(rawPct, Math.round(Math.max(timeFloor, 2))) : rawPct;

  const stuckJobs = group.jobs.filter((j) => j.status === 'processing' && isStuck(j.started_at));
  const hasStuckJobs = stuckJobs.length > 0;

  const team = useMemo(() => pickTeamForGroup(group.key), [group.key]);

  // Cycle through team members
  const teamTick = useVisibilityTick(3000, isProcessing);
  const msgIdx = teamTick % team.length;

  const currentAgent = team[msgIdx % team.length];
  const isStagingWorkflow = /interior|staging/i.test(group.workflow_name ?? '');
  const unitLabel = isStagingWorkflow ? 'styles' : 'images';
  const isProModel = group.job_type === 'tryon' || group.quality === 'high';

  // Multi-product batch: show aggregate title instead of single product name
  const productCount = uniqueProductCount(group);
  const isMultiProductBatch = productCount > 1;
  const titleSuffix = isMultiProductBatch
    ? ` — ${productCount} products`
    : group.product_name ? ` — ${group.product_name}` : '';

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.04] to-primary/[0.08] overflow-hidden">
      <CardContent className="py-3 px-4 sm:py-4 sm:px-5 space-y-2.5">
        {/* Header row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          {/* Avatar + agent name row */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Single rotating avatar */}
            <div className="relative shrink-0">
              <div className="relative w-10 h-10">
                {team.map((member, i) => (
                  <Avatar
                    key={member.name}
                    className={`w-10 h-10 absolute inset-0 transition-opacity duration-500 will-change-[opacity] ${
                      i === msgIdx % team.length ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                    <AvatarFallback className="text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {isProcessing && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse z-10" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {group.workflow_name ?? 'Workflow generation'}
                {titleSuffix}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasMultipleImages ? (
                  <>{group.generatedImageCount}/{group.totalImageCount} {unitLabel} · <ElapsedTimer startedAt={startedAt} enabled={true} /></>
                ) : isProcessing ? (
                  <>Generating… <ElapsedTimer startedAt={startedAt} enabled={true} /></>
                ) : (
                  <>Queued · <ElapsedTimer startedAt={startedAt} enabled={true} /></>
                )}
                {isProcessing && group.totalImageCount > 1 && (() => {
                  const estPerImg = isProModel ? 12 : 4;
                  const totalEstSec = group.totalImageCount * estPerImg;
                  const lowMin = Math.max(1, Math.ceil((totalEstSec * 0.8) / 60));
                  const highMin = Math.max(lowMin, Math.ceil((totalEstSec * 1.2) / 60));
                  return (
                    <span className="hidden sm:inline text-muted-foreground/60">
                      {' '}· est. ~{lowMin === highMin ? lowMin : `${lowMin}-${highMin}`} min total
                    </span>
                  );
                })()}
                {isProcessing && group.totalImageCount <= 1 && (
                  <span className="hidden sm:inline text-muted-foreground/60">
                    {' '}· est. ~{isProModel ? '60-120s' : '15-30s'}
                  </span>
                )}
              </p>
              {/* Agent status message */}
              {isProcessing && (
                <p className="text-[11px] text-primary/80 font-medium mt-0.5 flex items-center gap-1 animate-fade-in" key={currentAgent.name}>
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{currentAgent.name}: "{getRandomStatusMessage(currentAgent)}"</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions & badges */}
          <div className="flex items-center gap-2 shrink-0 pl-[52px] sm:pl-0">
            {hasStuckJobs && onCancelJob && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 h-7 text-xs"
                onClick={() => stuckJobs.forEach((j) => onCancelJob(j.id, j.credits_reserved ?? 0))}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
            {isProcessing && isProModel && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary hover:bg-primary/10">
                Pro
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={`text-[10px] uppercase tracking-wider font-semibold ${isProcessing ? 'bg-primary/10 text-primary' : ''}`}
            >
              {isProcessing ? 'Processing' : 'Queued'}
            </Badge>
          </div>
        </div>

        {/* Batch progress bar */}
        {hasMultipleImages && (
          <div className="relative">
            <Progress value={progressPct} className="h-1.5" />
            <span className="absolute right-0 -top-4 text-[10px] text-muted-foreground font-medium">
              {group.generatedImageCount}/{group.totalImageCount}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  const pg = prev.group;
  const ng = next.group;
  return pg.key === ng.key
    && pg.generatedImageCount === ng.generatedImageCount
    && pg.processingCount === ng.processingCount
    && pg.queuedCount === ng.queuedCount
    && pg.totalImageCount === ng.totalImageCount
    && pg.failedCount === ng.failedCount;
});

export function WorkflowActivityCard({
  batchGroups,
  completedGroups = [],
  failedGroups = [],
  onCancelJob,
  onDismiss,
}: WorkflowActivityCardProps) {
  const navigate = useNavigate();

  const hasContent = batchGroups.length > 0 || completedGroups.length > 0 || failedGroups.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      <p className="section-label">Activity</p>

      {/* Active groups */}
      {batchGroups.map((group) => (
        <ActiveGroupCard key={group.key} group={group} onCancelJob={onCancelJob} />
      ))}

      {/* Completed groups */}
      {completedGroups.map((group) => {
        const totalImages = group.totalImageCount > 1 ? group.totalImageCount : group.totalCount;
        const team = pickTeamForGroup(group.key);
        const isStagingWorkflow = /interior|staging/i.test(group.workflow_name ?? '');
        const completedProductCount = uniqueProductCount(group);
        const completedTitleSuffix = completedProductCount > 1
          ? ` — ${completedProductCount} products`
          : group.product_name ? ` — ${group.product_name}` : '';
        return (
          <Card key={group.key} className="border-emerald-500/20 bg-emerald-500/[0.04]">
            <CardContent className="py-3 px-4 sm:py-4 sm:px-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getOptimizedUrl(team[0].avatar, { quality: 60 })} alt={team[0].name} />
                      <AvatarFallback className="text-[10px] font-bold">{team[0].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {group.workflow_name ?? 'Workflow generation'}
                      {completedTitleSuffix}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalImages > 1
                        ? `${totalImages} ${isStagingWorkflow ? 'styles' : 'images'} complete`
                        : '1 image complete'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pl-[52px] sm:pl-0">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    Completed
                  </Badge>
                  <Button size="sm" variant="ghost" className="gap-1.5 h-7 text-xs" onClick={() => navigate('/app/library')}>
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  {onDismiss && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onDismiss(group.key)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Failed groups */}
      {failedGroups.map((group) => {
        const team = pickTeamForGroup(group.key);
        const refundedCredits = group.jobs
          .filter(j => j.status === 'failed')
          .reduce((sum, j) => sum + (j.credits_reserved ?? 0), 0);
        const failedProductCount = uniqueProductCount(group);
        const failedTitleSuffix = failedProductCount > 1
          ? ` — ${failedProductCount} products`
          : group.product_name ? ` — ${group.product_name}` : '';
        return (
          <Card key={group.key} className="border-destructive/20 bg-destructive/[0.04]">
            <CardContent className="py-3 px-4 sm:py-4 sm:px-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getOptimizedUrl(team[0].avatar, { quality: 60 })} alt={team[0].name} />
                      <AvatarFallback className="text-[10px] font-bold">{team[0].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center border-2 border-background">
                      <XCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                   <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {group.workflow_name ?? 'Workflow generation'}
                      {failedTitleSuffix}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {group.completedCount > 0
                        ? `${group.failedCount} of ${group.totalCount} failed · ${group.completedCount} image${group.completedCount !== 1 ? 's' : ''} saved to library`
                        : group.totalCount > 1
                          ? `${group.failedCount}/${group.totalCount} failed`
                          : '1 image failed'}
                      {group.completedCount === 0 && group.jobs[0]?.error_message ? ` · ${group.jobs[0].error_message.slice(0, 50)}` : ''}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {refundedCredits > 0
                        ? `${refundedCredits} credit${refundedCredits !== 1 ? 's' : ''} refunded automatically`
                        : 'Credits refunded automatically'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pl-[52px] sm:pl-0">
                  <Badge variant="destructive" className="text-[10px] uppercase tracking-wider font-semibold">
                    Failed
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() =>
                      navigate(
                        group.workflow_slug
                          ? `/app/generate/${group.workflow_slug}`
                          : group.workflow_id
                            ? `/app/generate?workflow=${group.workflow_id}`
                            : '/app/generate',
                      )
                    }
                  >
                    Retry
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  {onDismiss && (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onDismiss(group.key)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
