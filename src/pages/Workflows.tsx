import { useEffect, useRef, useCallback } from 'react';
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
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
            credits_reserved: j.credits_reserved ?? 0,
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
        .select('id, status, created_at, started_at, completed_at, payload, error_message')
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
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
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
        .select('id, status, created_at, started_at, completed_at, payload, error_message')
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
            product_name: ((p?.product as Record<string, unknown>)?.title as string) ?? null,
          };
        });
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  // ── Recent completed workflow jobs ──
  const { data: recentJobs = [], isLoading: isLoadingRecent } = useQuery({
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
    staleTime: 30_000,
  });

  // Auto-refresh recent jobs when active jobs complete
  useEffect(() => {
    if (prevActiveCountRef.current > 0 && activeJobs.length === 0) {
      queryClient.invalidateQueries({ queryKey: ['workflow-recent-jobs'] });
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
      // Mark job as failed via service — use direct REST update since RLS only allows
      // updating queued jobs; for processing jobs we call the cleanup function
      const { error: updateError } = await supabase
        .from('generation_queue')
        .update({ status: 'failed', error_message: 'Cancelled by user', completed_at: new Date().toISOString() } as never)
        .eq('id', jobId);

      if (updateError) {
        // If RLS blocks it (processing status), trigger cleanup instead
        await supabase.functions.invoke('retry-queue');
      }

      // Refund credits
      if (creditsReserved > 0) {
        await supabase.rpc('refund_credits', { p_user_id: user!.id, p_amount: creditsReserved });
      }

      toast.success(`Generation cancelled. ${creditsReserved} credits refunded.`);

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-failed-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    } catch (err) {
      console.error('Cancel job error:', err);
      toast.error('Failed to cancel job. Try again.');
    }
  }, [user, queryClient]);

  // ── Batch grouping ──
  const activeBatchGroups = groupJobsIntoBatches(activeJobs);
  const completedBatchGroups = groupJobsIntoBatches(recentlyCompletedJobs);
  const failedBatchGroups = groupJobsIntoBatches(recentlyFailedJobs);

  const hasActivity =
    activeBatchGroups.length > 0 ||
    completedBatchGroups.length > 0 ||
    failedBatchGroups.length > 0 ||
    recentJobs.length > 0;

  const handleCreateVisualSet = (workflow: Workflow) => {
    navigate(`/app/generate?workflow=${workflow.id}`);
  };

  return (
    <PageHeader
      title="Workflows"
      subtitle="Choose an outcome-driven workflow to generate professional visual sets."
    >
      {/* ── Activity section ── */}
      {hasActivity && (
        <div className="space-y-6">
          {(activeBatchGroups.length > 0 || completedBatchGroups.length > 0 || failedBatchGroups.length > 0) && (
            <WorkflowActivityCard
              batchGroups={activeBatchGroups}
              completedGroups={completedBatchGroups}
              failedGroups={failedBatchGroups}
              onCancelJob={handleCancelJob}
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
              workflow={workflow}
              onSelect={() => handleCreateVisualSet(workflow)}
              reversed={index % 2 !== 0}
            />
          ))}
        </div>
      )}
    </PageHeader>
  );
}
