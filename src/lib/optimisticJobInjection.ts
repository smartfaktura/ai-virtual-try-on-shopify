import type { QueryClient } from '@tanstack/react-query';
import type { ActiveJob } from '@/lib/batchGrouping';

interface InjectJobParams {
  jobId: string;
  workflow_id?: string | null;
  workflow_name?: string | null;
  workflow_slug?: string | null;
  product_name?: string | null;
  credits_reserved?: number;
  job_type?: string | null;
  quality?: string | null;
  batch_id?: string | null;
  resolution?: string | null;
  imageCount?: number;
}

/**
 * Optimistically injects a new job into the workflow-active-jobs cache
 * so it appears instantly on the Workflows page without waiting for the next poll.
 */
export function injectActiveJob(queryClient: QueryClient, params: InjectJobParams) {
  const newJob: ActiveJob = {
    id: params.jobId,
    status: 'queued',
    created_at: new Date().toISOString(),
    started_at: null,
    error_message: null,
    workflow_id: params.workflow_id ?? null,
    workflow_name: params.workflow_name ?? null,
    workflow_slug: params.workflow_slug ?? null,
    product_name: params.product_name ?? null,
    credits_reserved: params.credits_reserved ?? 0,
    job_type: params.job_type ?? null,
    quality: params.quality ?? null,
    batch_id: params.batch_id ?? null,
    resolution: params.resolution ?? null,
    imageCount: params.imageCount,
  };

  queryClient.setQueryData<ActiveJob[]>(['workflow-active-jobs'], (old) => [
    newJob,
    ...(old ?? []),
  ]);
}
