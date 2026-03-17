import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, XCircle, CheckCircle2, Clock, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { BatchGroup } from '@/lib/batchGrouping';

interface WorkflowActivityCardProps {
  batchGroups: BatchGroup[];
  completedGroups?: BatchGroup[];
  failedGroups?: BatchGroup[];
  onCancelJob?: (jobId: string, creditsReserved: number) => void;
  onDismiss?: (groupKey: string) => void;
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

function ActiveGroupCard({
  group,
  onCancelJob,
}: {
  group: BatchGroup;
  onCancelJob?: (jobId: string, creditsReserved: number) => void;
}) {
  const navigate = useNavigate();
  const isBatch = group.totalCount > 1;
  const progressPct = isBatch ? Math.round((group.completedCount / group.totalCount) * 100) : 0;
  const isProcessing = group.processingCount > 0;
  const elapsed = elapsedLabel(group.jobs.find((j) => j.started_at)?.started_at ?? group.created_at);

  const stuckJobs = group.jobs.filter((j) => j.status === 'processing' && isStuck(j.started_at));
  const hasStuckJobs = stuckJobs.length > 0;

  const team = useMemo(() => pickTeamForGroup(group.key), [group.key]);

  // Cycle through status messages
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % team.length), 3000);
    return () => clearInterval(id);
  }, [isProcessing, team.length]);

  const currentAgent = team[msgIdx % team.length];
  const isStagingWorkflow = /interior|staging/i.test(group.workflow_name ?? '');
  const unitLabel = isStagingWorkflow ? 'styles' : 'images';
  const isProModel = group.job_type === 'tryon' || group.quality === 'high';

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.04] to-primary/[0.08] overflow-hidden">
      <CardContent className="py-4 px-5 space-y-3">
        {/* Header row */}
        <div className="flex items-center gap-4">
          {/* Animated avatar stack */}
          <div className="relative flex items-center shrink-0">
            {team.slice(0, 3).map((member, i) => (
              <div
                key={member.name}
                className="relative rounded-full ring-2 ring-background"
                style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 3 - i }}
              >
                <Avatar className={`w-9 h-9 ${i === msgIdx % team.length && isProcessing ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                </Avatar>
                {i === 0 && isProcessing && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {group.workflow_name ?? 'Workflow generation'}
              {group.product_name ? ` — ${group.product_name}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {isBatch ? (
                <>{group.completedCount} of {group.totalCount} {unitLabel} generated · {elapsed}</>
              ) : isProcessing ? (
                <>1 image · Generating… {elapsed}</>
              ) : (
                <>1 image · Queued · waiting {elapsed}</>
              )}
            </p>
            {/* Animated agent status message */}
            {isProcessing && (
              <p className="text-[11px] text-primary/80 font-medium mt-0.5 flex items-center gap-1 animate-fade-in" key={currentAgent.name}>
                <Sparkles className="w-3 h-3" />
                {currentAgent.name}: "{currentAgent.statusMessage}"
              </p>
            )}
          </div>

          {/* Actions & badges */}
          <div className="flex items-center gap-2 shrink-0">
            {hasStuckJobs && onCancelJob && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => stuckJobs.forEach((j) => onCancelJob(j.id, j.credits_reserved ?? 0))}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
            {isProcessing && isProModel && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary hover:bg-primary/10">
                Pro Model
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

        {/* Time estimate */}
        {isProcessing && (
          <p className="text-[11px] text-muted-foreground/60 pl-[calc(3*2.25rem-16px+16px)]">
            {isProModel ? 'Pro' : 'Standard'} model — est. ~{isProModel ? '60-120s' : '15-30s'} per {isStagingWorkflow ? 'style' : 'image'}
            {isBatch && group.totalCount > 1 && ` · ~${Math.ceil(group.totalCount * (isProModel ? 1 : 0.25))}-${Math.ceil(group.totalCount * (isProModel ? 2 : 0.5))} min total`}
          </p>
        )}

        {/* Batch progress bar */}
        {isBatch && (
          <div className="relative">
            <Progress value={progressPct} className="h-1.5" />
            <span className="absolute right-0 -top-4 text-[10px] text-muted-foreground font-medium">
              {group.completedCount}/{group.totalCount}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkflowActivityCard({
  batchGroups,
  completedGroups = [],
  failedGroups = [],
  onCancelJob,
  onDismiss,
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
      {batchGroups.map((group) => (
        <ActiveGroupCard key={group.key} group={group} onCancelJob={onCancelJob} />
      ))}

      {/* Recently completed groups */}
      {completedGroups.map((group) => {
        const isBatch = group.totalCount > 1;
        const team = pickTeamForGroup(group.key);
        return (
          <Card key={group.key} className="border-emerald-500/20 bg-emerald-500/[0.04]">
            <CardContent className="flex items-center gap-4 py-4 px-5">
              <div className="relative flex items-center shrink-0">
                {team.slice(0, 2).map((member, i) => (
                  <div key={member.name} className="rounded-full ring-2 ring-background" style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 2 - i }}>
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {group.workflow_name ?? 'Workflow generation'}
                  {group.product_name ? ` — ${group.product_name}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const isStagingWorkflow = /interior|staging/i.test(group.workflow_name ?? '');
                    return isBatch
                      ? `${group.totalCount} of ${group.totalCount} ${isStagingWorkflow ? 'styles' : 'images'} complete`
                      : '1 image complete';
                  })()}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                Completed
              </Badge>
              <Button size="sm" variant="ghost" className="shrink-0 gap-1.5" onClick={() => navigate('/app/library')}>
                View Results
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              {onDismiss && (
                <Button size="icon" variant="ghost" className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onDismiss(group.key)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Failed groups */}
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
                  ? `${group.failedCount} of ${group.totalCount} images failed`
                  : '1 image failed'}
                {group.jobs[0]?.error_message ? ` · ${group.jobs[0].error_message.slice(0, 60)}` : ''}
              </p>
            </div>
            <Badge variant="destructive" className="shrink-0 text-[10px] uppercase tracking-wider font-semibold">
              Failed
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5"
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
              <Button size="icon" variant="ghost" className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onDismiss(group.key)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
