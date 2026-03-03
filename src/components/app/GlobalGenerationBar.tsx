import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowRight, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupJobsIntoBatches, type ActiveJob, type BatchGroup } from '@/lib/batchGrouping';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Pages where dedicated activity UI already exists */
const HIDDEN_PATHS = ['/app/workflows', '/app/generate'];

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
  const [minimized, setMinimized] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const prevActiveKeysRef = useRef<Set<string>>(new Set());
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

      // Map to ActiveJob shape
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
        };
      });

      return groupJobsIntoBatches(jobs);
    },
    enabled: !!user?.id,
    refetchInterval: 4000,
  });

  // Detect completed groups (were active, now gone)
  useEffect(() => {
    const currentKeys = new Set(activeGroups.map((g) => g.key));
    const prevKeys = prevActiveKeysRef.current;

    // Find groups that disappeared (completed)
    const justFinished: string[] = [];
    prevKeys.forEach((key) => {
      if (!currentKeys.has(key)) justFinished.push(key);
    });

    if (justFinished.length > 0) {
      // Create placeholder completed groups
      setCompletedGroups((prev) => {
        const newCompleted = justFinished.map((key) => ({
          key,
          workflow_id: null,
          workflow_name: 'Generation',
          product_name: null,
          jobs: [],
          totalCount: 0,
          completedCount: 0,
          processingCount: 0,
          queuedCount: 0,
          failedCount: 0,
          allCompleted: true,
          created_at: new Date().toISOString(),
          job_type: null,
          quality: null,
        }));
        return [...prev, ...newCompleted];
      });

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setCompletedGroups((prev) => prev.filter((g) => !justFinished.includes(g.key)));
      }, 8000);
    }

    prevActiveKeysRef.current = currentKeys;
  }, [activeGroups]);

  // Tick for elapsed time
  useEffect(() => {
    if (activeGroups.length === 0) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [activeGroups.length]);

  // Hide on pages with dedicated activity UI
  const isHiddenPage = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  // Filter out dismissed
  const visibleActive = activeGroups.filter((g) => !dismissedKeys.has(g.key));
  const visibleCompleted = completedGroups.filter((g) => !dismissedKeys.has(g.key));

  if (isHiddenPage || (visibleActive.length === 0 && visibleCompleted.length === 0)) return null;

  const totalJobs = visibleActive.reduce((sum, g) => sum + g.totalCount, 0);
  const processingJobs = visibleActive.reduce((sum, g) => sum + g.processingCount, 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-[calc(var(--sidebar-offset,264px)+16px)] z-30 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header row — always visible */}
          <button
            onClick={() => setMinimized((m) => !m)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
              {processingJobs > 0 ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : visibleCompleted.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">
                {visibleActive.length > 0
                  ? `${totalJobs} generation${totalJobs !== 1 ? 's' : ''} running`
                  : `Generation${visibleCompleted.length !== 1 ? 's' : ''} completed`}
              </p>
              {visibleActive.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {processingJobs} processing · {totalJobs - processingJobs} queued
                </p>
              )}
            </div>
            {minimized ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {/* Expanded detail list */}
          {!minimized && (
            <div className="border-t border-border/40 max-h-60 overflow-y-auto">
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
                  <div key={group.key} className="px-4 py-3 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {group.workflow_name ?? 'Generation'}
                          {group.product_name ? ` — ${group.product_name}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isBatch
                            ? `${group.completedCount}/${group.totalCount} done · ${elapsed}`
                            : isProcessing
                              ? `Generating… ${elapsed}`
                              : `Queued · ${elapsed}`}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'shrink-0 text-[10px] uppercase tracking-wider font-semibold',
                          isProcessing && 'bg-primary/10 text-primary hover:bg-primary/10',
                        )}
                      >
                        {isProcessing ? 'Processing' : 'Queued'}
                      </Badge>
                    </div>
                    {progressPct !== undefined && (
                      <Progress value={progressPct} className="h-1 mt-2" />
                    )}
                  </div>
                );
              })}

              {/* Completed groups */}
              {visibleCompleted.map((group) => (
                <div key={group.key} className="px-4 py-3 border-b border-border/20 last:border-0 bg-emerald-500/[0.04]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-sm font-medium flex-1 truncate">Generation complete</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 gap-1.5 h-7 text-xs"
                      onClick={() => navigate('/app/library')}
                    >
                      View Results
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-6 w-6 text-muted-foreground"
                      onClick={() => setDismissedKeys((s) => new Set([...s, group.key]))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer CTA */}
          {visibleActive.length > 0 && !minimized && (
            <div className="border-t border-border/40 px-4 py-2.5 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                onClick={() => navigate('/app/workflows')}
              >
                View in Workflows
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
