import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/brandedToast';
import { PageHeader } from '@/components/app/PageHeader';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { WorkflowCardCompact } from '@/components/app/WorkflowCardCompact';
import { WorkflowActivityCard } from '@/components/app/WorkflowActivityCard';
import { FreestylePromptCard } from '@/components/app/FreestylePromptCard';
import { WorkflowRecentRow } from '@/components/app/WorkflowRecentRow';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, LayoutList, Grid2X2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { groupJobsIntoBatches } from '@/lib/batchGrouping';
import type { ActiveJob } from '@/lib/batchGrouping';
import type { Workflow } from '@/types/workflow';
import { WorkflowRequestBanner } from '@/components/app/WorkflowRequestBanner';

export type { Workflow } from '@/types/workflow';

export default function Workflows() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const prevActiveCountRef = useRef(0);
  const isMobile = useIsMobile();

  // ── Layout preference ──
  type LayoutMode = 'rows' | '2col' | '3col';
  const [layout, setLayout] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem('workflow-layout') as LayoutMode | null;
      if (saved && ['rows', '2col', '3col'].includes(saved)) return saved;
    } catch {}
    return '3col';
  });

  const handleLayoutChange = (value: string) => {
    if (!value) return;
    const v = value as LayoutMode;
    setLayout(v);
    localStorage.setItem('workflow-layout', v);
  };

  // On mobile/tablet, clamp to 2col max
  const effectiveLayout = isMobile ? (layout === '3col' ? '2col' : layout) : layout;

  // ── Workflow catalog ──
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data as unknown as Workflow[]).filter(w => w.slug !== 'product-listing-set');
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
        .select('id, status, created_at, started_at, payload, error_message, job_type, credits_reserved, result')
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
          const r = j.result as Record<string, unknown> | null;
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
            imageCount: ((p?.image_count as number) || (p?.imageCount as number)) ?? undefined,
            generatedCount: (r?.generatedCount as number) ?? undefined,
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
        .select('id, status, created_at, started_at, completed_at, payload, error_message, job_type, credits_reserved, result')
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
          const r = j.result as Record<string, unknown> | null;
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
            imageCount: ((p?.image_count as number) || (p?.imageCount as number)) ?? undefined,
            generatedCount: (r?.generatedCount as number) ?? undefined,
          };
        });
    },
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // ── Recently failed workflow queue jobs (last 4h, auto-expire) ──
  const { data: recentlyFailedJobs = [] } = useQuery({
    queryKey: ['workflow-failed-jobs'],
    queryFn: async () => {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('generation_queue')
        .select('id, status, created_at, started_at, completed_at, payload, error_message, job_type, credits_reserved, result')
        .eq('status', 'failed')
        .gte('created_at', fourHoursAgo)
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
          const r = j.result as Record<string, unknown> | null;
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
            imageCount: ((p?.image_count as number) || (p?.imageCount as number)) ?? undefined,
            generatedCount: (r?.generatedCount as number) ?? undefined,
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
        .select('id, workflow_id, product_id, created_at, results, requested_count, workflows(name)')
        .not('workflow_id', 'is', null)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const rows = data ?? [];
      if (rows.length === 0) return [];

      // Group jobs by (workflow_id, product_id) within 60s of each other
      type RawRow = typeof rows[0];
      interface GroupedJob {
        id: string;
        workflow_id: string | null;
        workflow_name: string | null;
        created_at: string;
        results: unknown;
        requested_count: number;
        /** Tracks the timestamp of the most recently merged row (sliding window) */
        lastMergedTime: number;
      }

      const groups: GroupedJob[] = [];

      for (const row of rows) {
        const rowTime = new Date(row.created_at).getTime();
        const lastGroup = groups[groups.length - 1];

        if (
          lastGroup &&
          lastGroup.workflow_id === row.workflow_id &&
          // Sliding window: compare against the last merged row, not the anchor
          Math.abs(lastGroup.lastMergedTime - rowTime) <= 120_000
        ) {
          // Merge results
          const existing = Array.isArray(lastGroup.results) ? lastGroup.results : [];
          const incoming = Array.isArray(row.results) ? row.results : [];
          lastGroup.results = [...existing, ...incoming];
          lastGroup.requested_count += row.requested_count;
          lastGroup.lastMergedTime = rowTime;
          continue;
        }

        groups.push({
          id: row.id,
          workflow_id: row.workflow_id,
          workflow_name: (row.workflows as unknown as { name: string } | null)?.name ?? null,
          created_at: row.created_at,
          results: row.results,
          requested_count: row.requested_count,
          lastMergedTime: rowTime,
        });
      }

      return groups.slice(0, 8);
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

  // ── Auto-cleanup: trigger retry-queue for stuck processing jobs (throttled) ──
  const lastCleanupSignatureRef = useRef('');
  useEffect(() => {
    const stuckJobs = activeJobs.filter(
      (j) => j.status === 'processing' && j.started_at &&
        Date.now() - new Date(j.started_at).getTime() > 5 * 60 * 1000,
    );
    if (stuckJobs.length === 0) return;

    const signature = stuckJobs.map((j) => j.id).sort().join(',');
    if (signature === lastCleanupSignatureRef.current) return;
    lastCleanupSignatureRef.current = signature;

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

  // ── High-water mark for totalImageCount per batch key ──
  const totalImageHWM = useRef<Map<string, number>>(new Map());

  // ── Batch grouping: merge all jobs first, then categorize ──
  const allMergedGroups = useMemo(() => {
    // Deduplicate by id — active jobs take priority over completed/failed
    const seen = new Set<string>();
    const deduped: ActiveJob[] = [];
    for (const job of [...activeJobs, ...recentlyCompletedJobs, ...recentlyFailedJobs]) {
      if (!seen.has(job.id)) {
        seen.add(job.id);
        deduped.push(job);
      }
    }
    const groups = groupJobsIntoBatches(deduped);

    // Apply high-water mark so totalImageCount never shrinks for active groups
    const hwm = totalImageHWM.current;
    const activeKeys = new Set<string>();
    for (const g of groups) {
      const isActive = g.processingCount > 0 || g.queuedCount > 0;
      if (isActive) {
        activeKeys.add(g.key);
        const prev = hwm.get(g.key) ?? 0;
        if (g.totalImageCount > prev) {
          hwm.set(g.key, g.totalImageCount);
        } else {
          g.totalImageCount = prev;
        }
      }
    }
    // Clean up keys that are no longer active
    for (const key of hwm.keys()) {
      if (!activeKeys.has(key)) hwm.delete(key);
    }

    return groups;
  }, [activeJobs, recentlyCompletedJobs, recentlyFailedJobs]);

  const activeBatchGroups = allMergedGroups.filter(
    (g) => g.processingCount > 0 || g.queuedCount > 0,
  );
  const completedBatchGroups = allMergedGroups.filter(
    (g) => g.processingCount === 0 && g.queuedCount === 0 && g.completedCount > 0 && !dismissedKeys.has(g.key),
  );
  const twoHoursAgoMs = Date.now() - 2 * 60 * 60 * 1000;
  const failedBatchGroups = allMergedGroups.filter(
    (g) => g.processingCount === 0 && g.queuedCount === 0 && g.completedCount === 0 && g.failedCount > 0
      && !dismissedKeys.has(g.key) && new Date(g.created_at).getTime() > twoHoursAgoMs,
  );

  const hasActivity =
    activeBatchGroups.length > 0 ||
    completedBatchGroups.length > 0 ||
    failedBatchGroups.length > 0 ||
    recentJobs.length > 0;

  const handleCreateVisualSet = (workflow: Workflow) => {
    if (workflow.name === 'Picture Perspectives') {
      navigate('/app/perspectives');
      return;
    }
    if (workflow.slug === 'catalog-shot-set' || workflow.name === 'Catalog Studio') {
      navigate('/app/catalog');
      return;
    }
    navigate(workflow.slug ? `/app/generate/${workflow.slug}` : `/app/workflows`);
  };

  return (
    <PageHeader
      title="Visual Studio"
      subtitle="Turn one product photo into a full set of realistic brand visuals"
    >

      {/* ── Activity section ── */}
      {hasActivity && (activeBatchGroups.length > 0 || completedBatchGroups.length > 0 || failedBatchGroups.length > 0) && (
        <WorkflowActivityCard
          batchGroups={activeBatchGroups}
          completedGroups={completedBatchGroups}
          failedGroups={failedBatchGroups}
          onCancelJob={handleCancelJob}
          onDismiss={handleDismiss}
        />
      )}

      {/* ── Workflow catalog (heading + grid grouped tight) ── */}
      <section className="relative space-y-4">
        <div className="hidden sm:block absolute -top-12 right-0 z-10">
          <ToggleGroup
            type="single"
            value={effectiveLayout}
            onValueChange={handleLayoutChange}
            className="gap-1 rounded-lg border bg-card p-1 shadow-sm"
          >
            <ToggleGroupItem value="rows" aria-label="Row layout" className="h-8 w-8 p-0">
              <LayoutList className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="2col" aria-label="Two column layout" className="h-8 w-8 p-0">
              <Grid2X2 className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="3col" aria-label="Three column layout" className="h-8 w-8 p-0">
              <Grid3X3 className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="sm:hidden flex justify-end -mb-2">
          <ToggleGroup
            type="single"
            value={effectiveLayout}
            onValueChange={handleLayoutChange}
            className="gap-1 rounded-lg border bg-card p-1"
          >
            <ToggleGroupItem value="rows" aria-label="Row layout" className="h-8 w-8 p-0">
              <LayoutList className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="2col" aria-label="Two column layout" className="h-8 w-8 p-0">
              <Grid2X2 className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isLoading ? (
          effectiveLayout === 'rows' ? (
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
            <div className={`grid auto-rows-fr ${isMobile && effectiveLayout === '2col' ? 'gap-2.5' : 'gap-4'} ${effectiveLayout === '3col' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg border overflow-hidden">
                  <Skeleton className={`w-full ${isMobile && effectiveLayout === '2col' ? 'aspect-[2/3]' : 'aspect-square'}`} />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : effectiveLayout === 'rows' ? (
          <div className="space-y-6">
            {workflows.map((workflow, index) => (
              <WorkflowCard
                key={workflow.id}
                id={`workflow-${workflow.id}`}
                workflow={workflow}
                onSelect={() => handleCreateVisualSet(workflow)}
                reversed={index % 2 !== 0}
                beta={workflow.slug === 'catalog-shot-set' || workflow.name === 'Catalog Studio'}
              />
            ))}
            <FreestylePromptCard onSelect={() => navigate('/app/freestyle')} />
          </div>
        ) : (
          <div className={`grid ${isMobile && effectiveLayout === '2col' ? 'gap-2.5' : 'gap-4'} ${effectiveLayout === '3col' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
            {workflows.map((workflow) => (
              <WorkflowCardCompact
                key={workflow.id}
                id={`workflow-${workflow.id}`}
                workflow={workflow}
                onSelect={() => handleCreateVisualSet(workflow)}
                mobileCompact={isMobile && effectiveLayout === '2col'}
                beta={workflow.slug === 'catalog-shot-set' || workflow.name === 'Catalog Studio'}
              />
            ))}
            <FreestylePromptCard
              onSelect={() => navigate('/app/freestyle')}
              mobileCompact={isMobile && effectiveLayout === '2col'}
            />
          </div>
        )}
        <WorkflowRequestBanner />
      </section>

      {/* ── Recent Creations (heading + row grouped tight) ── */}
      {(recentJobs.length > 0 || isLoadingRecent) && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recent Creations</h2>
              <p className="text-base text-muted-foreground mt-1.5">Pick up where you left off.</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 shrink-0" onClick={() => navigate('/app/library')}>
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <WorkflowRecentRow jobs={recentJobs} isLoading={isLoadingRecent} />
        </section>
      )}
    </PageHeader>
  );
}
