/** Groups active queue jobs into batch groups for display */

export interface ActiveJob {
  id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  workflow_name: string | null;
  workflow_id: string | null;
  error_message: string | null;
  product_name?: string | null;
  credits_reserved?: number;
  job_type?: string | null;
  quality?: string | null;
}

export interface BatchGroup {
  key: string;
  workflow_id: string | null;
  workflow_name: string | null;
  product_name: string | null;
  jobs: ActiveJob[];
  totalCount: number;
  completedCount: number;
  processingCount: number;
  queuedCount: number;
  failedCount: number;
  /** True when all jobs in the group are completed (recently-completed groups) */
  allCompleted: boolean;
  /** Earliest created_at in group */
  created_at: string;
}

/**
 * Groups jobs that share the same workflow_id + product_name
 * and were created within 5 seconds of each other.
 */
export function groupJobsIntoBatches(jobs: ActiveJob[]): BatchGroup[] {
  if (jobs.length === 0) return [];

  const groups: BatchGroup[] = [];
  const used = new Set<string>();

  // Sort by created_at
  const sorted = [...jobs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].id)) continue;

    const anchor = sorted[i];
    const anchorTime = new Date(anchor.created_at).getTime();
    const batch: ActiveJob[] = [anchor];
    used.add(anchor.id);

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(sorted[j].id)) continue;
      const candidate = sorted[j];
      const candidateTime = new Date(candidate.created_at).getTime();

      if (
        candidate.workflow_id === anchor.workflow_id &&
        candidate.product_name === anchor.product_name &&
        Math.abs(candidateTime - anchorTime) <= 5_000
      ) {
        batch.push(candidate);
        used.add(candidate.id);
      }
    }

    const completedCount = batch.filter((j) => j.status === 'completed').length;
    const failedCount = batch.filter((j) => j.status === 'failed').length;
    const processingCount = batch.filter((j) => j.status === 'processing').length;
    const queuedCount = batch.filter((j) => j.status === 'queued').length;

    groups.push({
      key: `${anchor.workflow_id}-${anchor.product_name}-${anchorTime}`,
      workflow_id: anchor.workflow_id,
      workflow_name: anchor.workflow_name,
      product_name: anchor.product_name ?? null,
      jobs: batch,
      totalCount: batch.length,
      completedCount,
      processingCount,
      queuedCount,
      failedCount,
      allCompleted: completedCount + failedCount === batch.length && completedCount > 0,
      created_at: anchor.created_at,
    });
  }

  return groups;
}
