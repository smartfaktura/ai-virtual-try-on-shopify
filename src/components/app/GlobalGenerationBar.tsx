import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowRight, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupJobsIntoBatches, type ActiveJob, type BatchGroup } from '@/lib/batchGrouping';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Pages where dedicated activity UI already exists */
const HIDDEN_PATHS = ['/app/workflows', '/app/generate', '/app/freestyle'];

function elapsedLabel(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
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
  const [, tick] = useState(0);

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

      const jobs: ActiveJob[] = data.map((row) => {
        const payload = row.payload as Record<string, unknown> | null;
        return {
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          started_at: row.started_at,
          workflow_name: (payload?.workflow_name as string) ?? null,
          workflow_id: (payload?.workflow_id as string) ?? null,
          error_message: row.error_message,
          product_name: (payload?.product_name as string) ?? null,
          credits_reserved: row.credits_reserved,
          job_type: row.job_type,
          quality: (payload?.quality as string) ?? null,
          resolution: (payload?.resolution as string) ?? null,
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
      // Look up the original group data from previous active groups
      const prevGroups = prevActiveKeysRef.current;

      setCompletedGroups((prev) => {
        const newCompleted: BatchGroup[] = justFinished.map((key) => {
          // Find the original group from the previous render's activeGroups
          // We stored the full groups in a separate ref below
          const original = prevGroupsRef.current.find((g) => g.key === key);
          return {
            key,
            workflow_id: original?.workflow_id ?? null,
            workflow_name: original?.workflow_name ?? 'Generation',
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
          };
        });
        return [...prev, ...newCompleted];
      });

      // Invalidate library cache when upscale jobs complete
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

  // Tick for elapsed time
  useEffect(() => {
    if (activeGroups.length === 0) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [activeGroups.length]);

  const isHiddenPage = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  const visibleActive = activeGroups.filter((g) => !dismissedKeys.has(g.key));
  const visibleCompleted = completedGroups.filter((g) => !dismissedKeys.has(g.key));

  if (isHiddenPage || (visibleActive.length === 0 && visibleCompleted.length === 0)) return null;

  const totalJobs = visibleActive.reduce((sum, g) => sum + g.totalCount, 0);
  const processingJobs = visibleActive.reduce((sum, g) => sum + g.processingCount, 0);

  return (
    <div className="hidden sm:block fixed bottom-20 right-4 lg:right-6 z-30 pointer-events-none">
      <div className="pointer-events-auto w-64">
        {/* Expanded detail list — renders above the pill (hidden on mobile) */}
        {!minimized && (
          <div className="hidden sm:block mb-2 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              {visibleActive.map((group) => {
                const isProcessing = group.processingCount > 0;
                const elapsed = elapsedLabel(
                  group.jobs.find((j) => j.started_at)?.started_at ?? group.created_at,
                );
                const isBatch = group.totalCount > 1;
                const progressPct = isBatch
                  ? Math.round((group.completedCount / group.totalCount) * 100)
                  : undefined;

                return (
                  <div key={group.key} className="px-3 py-2.5 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {group.job_type === 'upscale'
                            ? `Upscaling to ${group.resolution === '4k' ? '4K' : '2K'}`
                            : (group.workflow_name ?? 'Generation')}
                          {group.product_name ? ` — ${group.product_name}` : ''}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isBatch
                            ? `${group.completedCount}/${group.totalCount} done · ${elapsed}`
                            : isProcessing
                              ? `${group.job_type === 'upscale' ? 'Upscaling' : 'Generating'}… ${elapsed}`
                              : `Queued · ${elapsed}`}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'shrink-0 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0',
                          isProcessing && 'bg-primary/10 text-primary hover:bg-primary/10',
                        )}
                      >
                        {isProcessing ? 'Processing' : 'Queued'}
                      </Badge>
                    </div>
                    {progressPct !== undefined && (
                      <Progress value={progressPct} className="h-1 mt-1.5" />
                    )}
                  </div>
                );
              })}

              {visibleCompleted.map((group) => (
                <div key={group.key} className="px-3 py-2.5 border-b border-border/20 last:border-0 bg-emerald-500/[0.04]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <p className="text-xs font-medium flex-1 truncate">
                      {group.job_type === 'upscale'
                        ? `Upscaled to ${group.resolution === '4k' ? '4K' : '2K'}`
                        : 'Complete'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 gap-1 h-6 text-[11px] px-2"
                      onClick={() => navigate('/app/library')}
                    >
                      View
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
              ))}
            </div>

            {visibleActive.length > 0 && (
              <div className="border-t border-border/40 px-3 py-2 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 h-7 text-[11px]"
                  onClick={() => navigate('/app/workflows')}
                >
                  View in Workflows
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Compact pill — always visible */}
        <button
          onClick={() => setMinimized((m) => !m)}
          className="w-full flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-border/60 bg-popover/95 backdrop-blur-xl shadow-lg shadow-black/10 hover:bg-muted/50 transition-colors"
        >
          <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 shrink-0">
            {processingJobs > 0 ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary animate-spin" />
            ) : visibleCompleted.length > 0 ? (
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
            ) : (
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
            )}
          </div>
          <span className="flex-1 text-left text-[11px] sm:text-xs font-medium truncate">
            {visibleActive.length > 0
              ? `${totalJobs} running`
              : `Complete`}
          </span>
          {minimized ? (
            <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
