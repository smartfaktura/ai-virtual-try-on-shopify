import { useEffect, useState, useRef } from 'react';
import { useVisibilityTick } from '@/hooks/useVisibilityTick';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupJobsIntoBatches, type ActiveJob, type BatchGroup } from '@/lib/batchGrouping';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS, getStableStatusMessage, type TeamMember } from '@/data/teamData';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

/** Pages where dedicated activity UI already exists */
const HIDDEN_PATHS = ['/app/workflows', '/app/generate', '/app/perspectives', '/app/video'];

function elapsedLabel(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Maps job types to the contextual team member */
function getTeamMemberForJob(group: BatchGroup): TeamMember {
  if (group.isCreativeDrop) return TEAM_MEMBERS.find(m => m.name === 'Amara')!;
  switch (group.job_type) {
    case 'video': return TEAM_MEMBERS.find(m => m.name === 'Leo')!;
    case 'freestyle': return TEAM_MEMBERS.find(m => m.name === 'Sophia')!;
    case 'upscale': return TEAM_MEMBERS.find(m => m.name === 'Luna')!;
    case 'tryon': return TEAM_MEMBERS.find(m => m.name === 'Zara')!;
    default: return TEAM_MEMBERS.find(m => m.name === 'Kenji')!;
  }
}

/** Returns a short verb phrase for the pill text */
function getActionVerb(group: BatchGroup): string {
  if (group.isCreativeDrop) return 'creating your drop';
  switch (group.job_type) {
    case 'video': return group.totalCount > 1 ? `creating ${group.totalCount} videos` : 'creating your video';
    case 'freestyle': return 'shooting';
    case 'upscale': return 'upscaling';
    case 'tryon': return 'styling';
    default: return 'creating';
  }
}

export function GlobalGenerationBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [minimized, setMinimized] = useState(true);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const prevActiveKeysRef = useRef<Set<string>>(new Set());
  const prevGroupsRef = useRef<BatchGroup[]>([]);
  const [completedGroups, setCompletedGroups] = useState<BatchGroup[]>([]);

  // Poll active jobs globally
  const { data: activeGroups = [] } = useQuery({
    queryKey: ['global-generation-bar', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('generation_queue')
        .select('id, status, created_at, started_at, error_message, credits_reserved, job_type, payload')
        .eq('user_id', user.id)
        .in('status', ['queued', 'processing'])
        .order('created_at', { ascending: true });

      if (!data || data.length === 0) return [];

      // For video jobs that are "processing" for a while, check if their videos
      // are already done in generated_videos — if so, filter them out to prevent
      // the floating bar from showing stale "creating" state
      const videoProcessingJobs = data.filter(
        r => r.job_type === 'video' && r.status === 'processing' && r.started_at &&
          (Date.now() - new Date(r.started_at).getTime()) > 30000
      );
      const completedVideoJobIds = new Set<string>();
      if (videoProcessingJobs.length > 0) {
        const projectIds = videoProcessingJobs
          .map(j => (j.payload as Record<string, unknown>)?.project_id as string)
          .filter(Boolean);
        if (projectIds.length > 0) {
          const { data: doneVideos } = await supabase
            .from('generated_videos')
            .select('project_id')
            .in('project_id', projectIds)
            .in('status', ['complete', 'completed', 'failed']);
          const doneProjectIds = new Set((doneVideos || []).map(v => v.project_id).filter(Boolean));
          for (const job of videoProcessingJobs) {
            const pid = (job.payload as Record<string, unknown>)?.project_id as string;
            if (pid && doneProjectIds.has(pid)) {
              completedVideoJobIds.add(job.id);
            }
          }
        }
      }

      const filteredData = data.filter(r => !completedVideoJobIds.has(r.id));
      if (filteredData.length === 0) return [];

      const jobs: ActiveJob[] = filteredData.map((row) => {
        const payload = row.payload as Record<string, unknown> | null;
        return {
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          started_at: row.started_at,
          workflow_name: (payload?.workflow_name as string) ?? null,
          workflow_id: (payload?.workflow_id as string) ?? null,
          workflow_slug: (payload?.workflow_slug as string) ?? null,
          error_message: row.error_message,
          product_name: (payload?.product_name as string) ?? null,
          credits_reserved: row.credits_reserved,
          job_type: row.job_type,
          quality: (payload?.quality as string) ?? null,
          resolution: (payload?.resolution as string) ?? null,
          creative_drop_id: (payload?.creative_drop_id as string) ?? null,
          batch_id: (payload?.batch_id as string) ?? null,
        };
      });

      return groupJobsIntoBatches(jobs);
    },
    enabled: !!user?.id,
    refetchInterval: 4000,
  });

  // Detect completed groups
  useEffect(() => {
    const currentKeys = new Set(activeGroups.map((g) => g.key));
    const prevKeys = prevActiveKeysRef.current;

    const justFinished: string[] = [];
    prevKeys.forEach((key) => {
      if (!currentKeys.has(key)) justFinished.push(key);
    });

    if (justFinished.length > 0) {
      setCompletedGroups((prev) => {
        const newCompleted: BatchGroup[] = justFinished.map((key) => {
          const original = prevGroupsRef.current.find((g) => g.key === key);
          return {
            key,
            workflow_id: original?.workflow_id ?? null,
            workflow_name: original?.workflow_name ?? 'Generation',
            workflow_slug: original?.workflow_slug ?? null,
            product_name: original?.product_name ?? null,
            jobs: [],
            totalCount: original?.totalCount ?? 0,
            completedCount: original?.totalCount ?? 0,
            processingCount: 0,
            queuedCount: 0,
            failedCount: 0,
            allCompleted: true,
            created_at: new Date().toISOString(),
            job_type: original?.job_type ?? null,
            quality: original?.quality ?? null,
            resolution: original?.resolution ?? null,
            isCreativeDrop: original?.isCreativeDrop ?? false,
            totalImageCount: original?.totalImageCount ?? 0,
            generatedImageCount: original?.generatedImageCount ?? 0,
          };
        });
        return [...prev, ...newCompleted];
      });

      const hadUpscale = justFinished.some((key) =>
        prevGroupsRef.current.find((g) => g.key === key && g.job_type === 'upscale')
      );
      if (hadUpscale) {
        queryClient.invalidateQueries({ queryKey: ['library'] });
      }

      setTimeout(() => {
        setCompletedGroups((prev) => prev.filter((g) => !justFinished.includes(g.key)));
      }, 8000);
    }

    prevActiveKeysRef.current = currentKeys;
    prevGroupsRef.current = activeGroups;
  }, [activeGroups, queryClient]);

  useVisibilityTick(1000, activeGroups.length > 0);
  const quoteIndex = useVisibilityTick(4000, activeGroups.length > 0);

  const isHiddenPage = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));
  const isFreestylePage = location.pathname.startsWith('/app/freestyle');

  const filteredActive = isFreestylePage
    ? activeGroups.filter((g) => g.job_type === 'upscale')
    : activeGroups;
  const filteredCompleted = isFreestylePage
    ? completedGroups.filter((g) => g.job_type === 'upscale')
    : completedGroups;

  const visibleActive = filteredActive.filter((g) => !dismissedKeys.has(g.key));
  const visibleCompleted = filteredCompleted.filter((g) => !dismissedKeys.has(g.key));

  if (isHiddenPage || (visibleActive.length === 0 && visibleCompleted.length === 0)) return null;

  const processingJobs = visibleActive.reduce((sum, g) => sum + g.processingCount, 0);

  // Get unique team members for active groups (for pill display)
  const activeMembers = visibleActive.map(g => getTeamMemberForJob(g));
  const uniqueMembers = activeMembers.filter((m, i, arr) => arr.findIndex(x => x.name === m.name) === i).slice(0, 3);
  const primaryMember = uniqueMembers[0];

  // Rotating status message from active group members
  const rotatingMember = activeMembers.length > 0
    ? activeMembers[quoteIndex % activeMembers.length]
    : null;

  return (
    <div className="hidden sm:block fixed top-20 right-4 lg:right-6 z-30 pointer-events-none">
      <div className="pointer-events-auto w-72">
        {/* Compact pill */}
        <button
          onClick={() => setMinimized((m) => !m)}
          className="w-full flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-border/60 bg-popover/95 backdrop-blur-xl shadow-lg shadow-black/10 hover:bg-muted/50 transition-colors"
        >
          {visibleActive.length > 0 && primaryMember ? (
            <div className="relative shrink-0">
              {/* Stacked avatars */}
              <div className="flex -space-x-1.5">
                {uniqueMembers.map((member, i) => (
                  <Avatar
                    key={member.name}
                    className={cn(
                      'w-6 h-6 ring-2 ring-popover',
                      i > 0 && 'relative',
                    )}
                    style={{ zIndex: uniqueMembers.length - i }}
                  >
                    <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                    <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{member.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          ) : visibleCompleted.length > 0 ? (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          ) : null}

          <span className="flex-1 text-left text-[11px] sm:text-xs font-medium truncate text-foreground">
            {visibleActive.length > 0 && primaryMember
              ? `${primaryMember.name} is ${getActionVerb(visibleActive[0])}…`
              : 'Complete'}
          </span>

          {minimized ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Expanded detail list */}
        {!minimized && (
          <div className="hidden sm:block mt-2 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {visibleActive.map((group) => {
                const member = getTeamMemberForJob(group);
                const isProcessing = group.processingCount > 0;
                const elapsed = elapsedLabel(
                  group.jobs.find((j) => j.started_at)?.started_at ?? group.created_at,
                );
                const isBatch = group.totalCount > 1;
                const progressPct = isBatch
                  ? Math.round((group.completedCount / group.totalCount) * 100)
                  : undefined;
                const isUpscale = group.job_type === 'upscale';

                return (
                  <div key={group.key} className="px-3 py-3 border-b border-border/20 last:border-0">
                    <div className="flex items-start gap-2.5">
                      <div className="relative shrink-0 mt-0.5">
                        <Avatar className="w-7 h-7 ring-1 ring-border/30">
                        <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{member.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">
                          {isUpscale
                            ? `${member.name} is upscaling to ${group.resolution === '4k' ? '4K' : '2K'}`
                            : group.job_type === 'video' ? `${member.name} is creating ${group.totalCount > 1 ? `${group.totalCount} videos` : 'your video'}`
                            : group.isCreativeDrop ? `${member.name} is creating your drop`
                            : group.job_type === 'freestyle' ? `${member.name} is shooting`
                            : group.job_type === 'tryon' ? `${member.name} is styling`
                            : `${member.name} is creating`}
                          {group.product_name ? ` — ${group.product_name}` : ''}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                          "{getStableStatusMessage(member, quoteIndex)}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-[10px] text-muted-foreground">
                            {isBatch
                              ? `${group.completedCount}/${group.totalCount} done · ${elapsed}`
                              : `${elapsed}`}
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'ml-auto shrink-0 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0 h-4 rounded-md',
                              isProcessing
                                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10'
                                : 'bg-muted text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {isProcessing ? 'Processing' : 'Queued'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {progressPct !== undefined && (
                      <Progress value={progressPct} className="h-1 mt-2" />
                    )}
                  </div>
                );
              })}

              {visibleCompleted.map((group) => {
                const member = getTeamMemberForJob(group);
                const isVideo = group.job_type === 'video';
                return (
                  <div key={group.key} className="px-3 py-3 border-b border-border/20 last:border-0 bg-emerald-500/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 ring-1 ring-emerald-500/30 shrink-0">
                        <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                        <AvatarFallback className="text-[8px] bg-emerald-500/10 text-emerald-600">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">
                          {isVideo ? (group.totalCount > 1 ? `${group.totalCount} videos are ready!` : 'Your video is ready!') 
                            : group.job_type === 'upscale' ? `Upscaled to ${group.resolution === '4k' ? '4K' : '2K'}`
                            : 'Your images are ready!'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {member.name} finished the job ✨
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 gap-1 h-6 text-[11px] px-2"
                        onClick={() => {
                          if (group.job_type === 'video') {
                            navigate('/app/video');
                          } else if (location.pathname.startsWith('/app/library')) {
                            window.dispatchEvent(new CustomEvent('library:focus-grid'));
                          } else {
                            navigate('/app/library');
                          }
                        }}
                      >
                        {group.job_type === 'video' ? 'View in Videos' : 'View'}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                      <button
                        className="shrink-0 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded"
                        onClick={() => setDismissedKeys((s) => new Set([...s, group.key]))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rotating quote footer */}
            {visibleActive.length > 0 && rotatingMember && (
              <div className="border-t border-border/30 px-3 py-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5 shrink-0">
                    <AvatarImage src={getOptimizedUrl(rotatingMember.avatar, { quality: 60 })} alt={rotatingMember.name} />
                    <AvatarFallback className="text-[6px]">{rotatingMember.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-[10px] text-muted-foreground italic truncate transition-all duration-300">
                    {rotatingMember.name}: "{getStableStatusMessage(rotatingMember, quoteIndex)}"
                  </p>
                </div>
              </div>
            )}

            {visibleActive.length > 0 && (
              <div className="border-t border-border/40 px-3 py-2 flex justify-end">
                {(() => {
                  const hasCreativeDrop = visibleActive.some((g) => g.isCreativeDrop);
                  const hasUpscale = visibleActive.some((g) => g.job_type === 'upscale');
                  const hasFreestyle = visibleActive.some((g) => g.job_type === 'freestyle');
                  const hasVideo = visibleActive.some((g) => g.job_type === 'video');
                  const targetPath = hasCreativeDrop ? '/app/creative-drops' : hasUpscale ? '/app/library' : hasVideo ? '/app/video/animate' : hasFreestyle ? '/app/freestyle' : '/app/workflows';
                  const targetLabel = hasCreativeDrop ? 'View in Content Calendar' : hasUpscale ? 'View in Library' : hasVideo ? 'View in Animate' : hasFreestyle ? 'View in Freestyle' : 'View in Templates';
                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-7 text-[11px]"
                      onClick={() => navigate(targetPath)}
                    >
                      {targetLabel}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
