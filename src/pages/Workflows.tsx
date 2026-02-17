import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { WorkflowActivityCard } from '@/components/app/WorkflowActivityCard';
import { WorkflowRecentRow } from '@/components/app/WorkflowRecentRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Workflow } from '@/types/workflow';

export type { Workflow } from '@/types/workflow';

export default function Workflows() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        .select('id, status, created_at, started_at, payload, error_message, job_type')
        .in('status', ['queued', 'processing'])
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data ?? [])
        .filter((j) => j.job_type === 'workflow')
        .map((j) => {
          const p = j.payload as Record<string, unknown> | null;
          return {
            id: j.id,
            status: j.status,
            created_at: j.created_at,
            started_at: j.started_at,
            error_message: j.error_message,
            workflow_id: (p?.workflow_id as string) ?? null,
            workflow_name: (p?.workflow_name as string) ?? null,
          };
        });
    },
    enabled: !!user,
    refetchInterval: (query) =>
      (query.state.data?.length ?? 0) > 0 ? 5000 : false,
  });

  // ── Just-completed workflow jobs (last 5 min) ──
  const { data: justCompletedJobs = [] } = useQuery({
    queryKey: ['workflow-just-completed'],
    queryFn: async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('id, workflow_id, created_at, completed_at, workflows(name)')
        .not('workflow_id', 'is', null)
        .eq('status', 'completed')
        .gte('completed_at', fiveMinAgo)
        .order('completed_at', { ascending: false })
        .limit(3);
      if (error) throw error;

      return (data ?? []).map((j) => ({
        id: j.id,
        workflow_id: j.workflow_id,
        workflow_name: (j.workflows as unknown as { name: string } | null)?.name ?? null,
        completed_at: j.completed_at,
      }));
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });

  // ── Recently failed workflow jobs (last 24h) ──
  const { data: failedJobs = [] } = useQuery({
    queryKey: ['workflow-failed-jobs'],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('id, workflow_id, created_at, error_message, workflows(name)')
        .not('workflow_id', 'is', null)
        .eq('status', 'failed')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;

      return (data ?? []).map((j) => ({
        id: j.id,
        workflow_id: j.workflow_id,
        workflow_name: (j.workflows as unknown as { name: string } | null)?.name ?? null,
        created_at: j.created_at,
        error_message: j.error_message,
      }));
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

  const hasActivity = activeJobs.length > 0 || justCompletedJobs.length > 0 || failedJobs.length > 0 || recentJobs.length > 0;

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
          {(activeJobs.length > 0 || justCompletedJobs.length > 0 || failedJobs.length > 0) && (
            <WorkflowActivityCard
              jobs={activeJobs}
              completedJobs={justCompletedJobs}
              failedJobs={failedJobs}
            />
          )}
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
