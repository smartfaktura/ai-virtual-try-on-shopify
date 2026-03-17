import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { WorkflowActivityCard } from '@/components/app/WorkflowActivityCard';
import { WorkflowRecentRow } from '@/components/app/WorkflowRecentRow';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupJobsIntoBatches } from '@/lib/batchGrouping';
import type { ActiveJob } from '@/lib/batchGrouping';
import type { Workflow } from '@/types/workflow';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';

export type { Workflow } from '@/types/workflow';

export default function Workflows() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const prevActiveCountRef = useRef(0);
  const autoCleanupTriggeredRef = useRef(false);

  // ── Workflow catalog ──
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Active jobs (queued / processing) ──
  const { data: activeJobs = [] } = useQuery({
    queryKey: ['workflow-active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_queue')
        .select('id, status, created_at, started_at, payload, error_message, job_type, credits_reserved')
        .in('status', ['queued', 'processing'])
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data ?? [])
        .filter((j) => {
          const p = j.payload as Record<string, unknown> | null;
          return p?.workflow_id != null;
        })
        .map((j): ActiveJob => {
          const p = j.payload as Record<string, unknown> | null;
          return {
            id: j.id,
            status: j.status,
            created_at: j.created_at,
            started_at: j.started_at,
            error_message: j.error_message,
            workflow_id: (p?.workflow_id as string) ?? null,
            workflow_name: (p?.workflow_name as string) ?? null,
            workflow_slug: (p?.workflow_slug as string) ?? null,
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
            credits_reserved: j.credits_reserved ?? 0,
            job_type: j.job_type ?? null,
            quality: (p?.quality as string) ?? null,
            batch_id: (p?.batch_id as string) ?? null,
          };
        });
    },
    enabled: !!user,
    refetchInterval: 5_000,
  });

  // ── Recently completed workflow queue jobs (last 60s) ──
  const { data: recentlyCompletedJobs = [] } = useQuery({
    queryKey: ['workflow-recently-completed'],
    queryFn: async () => {
      const sixtySecsAgo = new Date(Date.now() - 60_000).toISOString();
      const { data, error } = await supabase
        .from('generation_queue')
        .select('id, status, created_at, started_at, completed_at, payload, error_message, job_type')
        .eq('status', 'completed')
        .gte('completed_at', sixtySecsAgo)
        .order('completed_at', { ascending: false });
      if (error) throw error;

      return (data ?? [])
        .filter((j) => {
          const p = j.payload as Record<string, unknown> | null;
          return p?.workflow_id != null;
        })
        .map((j): ActiveJob => {
          const p = j.payload as Record<string, unknown> | null;
          return {
            id: j.id,
            status: j.status,
            created_at: j.created_at,
            started_at: j.started_at,
            error_message: j.error_message,
            workflow_id: (p?.workflow_id as string) ?? null,
            workflow_name: (p?.workflow_name as string) ?? null,
            workflow_slug: (p?.workflow_slug as string) ?? null,
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
            job_type: j.job_type ?? null,
            quality: (p?.quality as string) ?? null,
            batch_id: (p?.batch_id as string) ?? null,
          };
        });
    },
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // ── Recently failed workflow queue jobs (last 24h) ──
  const { data: recentlyFailedJobs = [] } = useQuery({
    queryKey: ['workflow-failed-jobs'],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('generation_queue')
        .select('id, status, created_at, started_at, completed_at, payload, error_message, job_type')
        .eq('status', 'failed')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;

      return (data ?? [])
        .filter((j) => {
          const p = j.payload as Record<string, unknown> | null;
          return p?.workflow_id != null;
        })
        .map((j): ActiveJob => {
          const p = j.payload as Record<string, unknown> | null;
          return {
            id: j.id,
            status: j.status,
            created_at: j.created_at,
            started_at: j.started_at,
            error_message: j.error_message,
            workflow_id: (p?.workflow_id as string) ?? null,
            workflow_name: (p?.workflow_name as string) ?? null,
            workflow_slug: (p?.workflow_slug as string) ?? null,
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
            job_type: j.job_type ?? null,
            quality: (p?.quality as string) ?? null,
            batch_id: (p?.batch_id as string) ?? null,
          };
        });
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // ── Recent completed workflow jobs ──
  const { data: recentWorkflowJobs = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['workflow-recent-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('id, workflow_id, created_at, results, requested_count, workflows(name)')
        .not('workflow_id', 'is', null)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;

      return (data ?? []).map((j) => ({
        id: j.id,
        workflow_id: j.workflow_id,
        workflow_name: (j.workflows as unknown as { name: string } | null)?.name ?? null,
        created_at: j.created_at,
        results: j.results,
        requested_count: j.requested_count,
      }));
    },
    enabled: !!user,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  // ── Recent Picture Perspectives from freestyle_generations ──
  const { data: recentPerspectives = [] } = useQuery({
    queryKey: ['workflow-recent-perspectives'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('freestyle_generations')
        .select('id, created_at, image_url, workflow_label')
        .like('workflow_label', 'Picture Perspectives%')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      // Group rows within 10 minutes of each other into synthetic "jobs"
      const rows = data ?? [];
      if (rows.length === 0) return [];

      const groups: { id: string; created_at: string; results: { url: string }[] }[] = [];
      let currentGroup: typeof groups[0] | null = null;

      for (const row of rows) {
        const rowTime = new Date(row.created_at).getTime();
        if (currentGroup) {
          const groupTime = new Date(currentGroup.created_at).getTime();
          if (Math.abs(rowTime - groupTime) <= 30 * 1000) {
            currentGroup.results.push({ url: row.image_url });
            continue;
          }
        }
        currentGroup = {
          id: row.id,
          created_at: row.created_at,
          results: [{ url: row.image_url }],
        };
        groups.push(currentGroup);
      }

      return groups.map((g) => ({
        id: g.id,
        workflow_id: 'perspectives' as string | null,
        workflow_name: 'Picture Perspectives',
        created_at: g.created_at,
        results: g.results,
        requested_count: g.results.length,
      }));
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Merge and sort recent jobs
  const recentJobs = useMemo(() => {
    const merged = [...recentWorkflowJobs, ...recentPerspectives];
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged.slice(0, 8);
  }, [recentWorkflowJobs, recentPerspectives]);

  // Auto-refresh recent jobs when active jobs complete
  useEffect(() => {
    if (prevActiveCountRef.current > 0 && activeJobs.length === 0) {
      queryClient.invalidateQueries({ queryKey: ['workflow-recent-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-recent-perspectives'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-failed-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-recently-completed'] });
    }
    prevActiveCountRef.current = activeJobs.length;
  }, [activeJobs.length, queryClient]);

  // ── Auto-cleanup: trigger retry-queue for stuck processing jobs ──
  useEffect(() => {
    if (autoCleanupTriggeredRef.current) return;
    const stuckJobs = activeJobs.filter(
      (j) => j.status === 'processing' && j.started_at &&
        Date.now() - new Date(j.started_at).getTime() > 5 * 60 * 1000,
    );
    if (stuckJobs.length === 0) return;

    autoCleanupTriggeredRef.current = true;
    console.log('[Workflows] Auto-triggering cleanup for', stuckJobs.length, 'stuck jobs');

    supabase.functions.invoke('retry-queue').then(() => {
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-failed-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    });
  }, [activeJobs, queryClient]);

  // ── Cancel stuck job handler ──
  const handleCancelJob = useCallback(async (jobId: string, creditsReserved: number) => {
    try {
      // RLS policy allows updating queued/processing → cancelled
      const { data, error: updateError } = await supabase
        .from('generation_queue')
        .update({ status: 'cancelled' } as never)
        .eq('id', jobId)
        .select('id')
        .single();

      if (updateError || !data) {
        // Fallback: trigger cleanup for stuck processing jobs
        await supabase.functions.invoke('retry-queue');
        toast.info('Cleanup triggered — job will be cancelled shortly.');
      } else {
        // Refund is handled server-side by trg_queue_cancel trigger
        toast.success(`Generation cancelled. ${creditsReserved} credits refunded.`);
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-failed-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    } catch (err) {
      console.error('Cancel job error:', err);
      toast.error('Failed to cancel job. Try again.');
    }
  }, [queryClient]);

  // ── Dismissed activity (localStorage-backed) ──
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('dismissed-activity');
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch { return new Set(); }
  });

  const handleDismiss = useCallback((key: string) => {
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem('dismissed-activity', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ── Batch grouping ──
  const activeBatchGroups = groupJobsIntoBatches(activeJobs);
  const completedBatchGroups = groupJobsIntoBatches(recentlyCompletedJobs).filter((g) => !dismissedKeys.has(g.key));
  const failedBatchGroups = groupJobsIntoBatches(recentlyFailedJobs).filter((g) => !dismissedKeys.has(g.key));

  const hasActivity =
    activeBatchGroups.length > 0 ||
    completedBatchGroups.length > 0 ||
    failedBatchGroups.length > 0 ||
    recentJobs.length > 0;

  const handleCreateVisualSet = (workflow: Workflow) => {
    // Picture Perspectives uses its standalone single-page layout
    if (workflow.name === 'Picture Perspectives') {
      navigate('/app/perspectives');
      return;
    }
    navigate(workflow.slug ? `/app/generate/${workflow.slug}` : `/app/workflows`);
  };

  return (
    <PageHeader
      title="Workflows"
      subtitle="Pick a workflow to start generating — or jump to one below."
    >
      {/* ── Quick-nav pills ── */}
      {!isLoading && workflows.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() =>
                document
                  .getElementById(`workflow-${wf.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              className="px-3 py-1.5 text-xs font-medium rounded-full border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              {wf.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Activity section ── */}
      {hasActivity && (
        <div className="space-y-6">
          {(activeBatchGroups.length > 0 || completedBatchGroups.length > 0 || failedBatchGroups.length > 0) && (
            <WorkflowActivityCard
              batchGroups={activeBatchGroups}
              completedGroups={completedBatchGroups}
              failedGroups={failedBatchGroups}
              onCancelJob={handleCancelJob}
              onDismiss={handleDismiss}
            />
          )}
          <div className="flex items-center gap-3">
            <span className="section-label shrink-0">Recent Creations</span>
            <div className="flex-1 h-px bg-border" />
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 shrink-0" onClick={() => navigate('/app/library')}>
              View All
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <WorkflowRecentRow jobs={recentJobs} isLoading={isLoadingRecent} />

          <div className="section-divider">
            <span className="section-label">Create a New Set</span>
          </div>
        </div>
      )}

      {/* ── Workflow catalog ── */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <Skeleton className="w-full lg:w-[45%] aspect-[4/3] lg:aspect-[3/4]" />
                <div className="flex-1 p-6 lg:p-10 space-y-4">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-11 w-36 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {workflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.id}
              id={`workflow-${workflow.id}`}
              workflow={workflow}
              onSelect={() => handleCreateVisualSet(workflow)}
              reversed={index % 2 !== 0}
            />
          ))}
          <FeedbackBanner />
        </div>
      )}
    </PageHeader>
  );
}
