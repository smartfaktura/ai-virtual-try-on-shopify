

## Fix: Stuck Processing Jobs Never Get Cleaned Up

### Root Cause

The cleanup mechanism has a gap:

- `cleanup_stale_jobs` (DB function) correctly fails timed-out processing jobs and refunds credits
- But it only runs inside `process-queue`, which only triggers when new jobs are enqueued
- The client-side stuck detection in `useGenerationQueue` only watches for `queued` jobs stuck > 30s -- it ignores `processing` jobs
- Result: if a processing job times out and no new jobs come in, it sits in `processing` forever

### Immediate Fix: Clean Up the 4 Stuck Jobs Now

Run `cleanup_stale_jobs` to fail the 4 stuck jobs and refund credits immediately. This will be done by calling the retry-queue function which triggers process-queue.

### Permanent Fix: Client-Side Timeout Detection for Processing Jobs

**File: `src/hooks/useGenerationQueue.ts`**

Add a check in the polling loop: if a job has been in `processing` status for longer than 5 minutes (matching the server-side timeout), trigger `retry-queue` to invoke `cleanup_stale_jobs`.

In the `pollJobStatus` callback, after the existing queued-stuck detection block (around line 117-131), add a parallel check for processing jobs:

```typescript
// Existing: stuck detection for queued jobs
if (job.status === 'queued') {
  // ... existing code ...
}

// NEW: stuck detection for processing jobs
if (job.status === 'processing' && job.started_at) {
  const processingDuration = Date.now() - new Date(job.started_at).getTime();
  // 5 minutes = server-side timeout_at threshold
  if (processingDuration > 5 * 60 * 1000 && !retriggeredRef.current) {
    retriggeredRef.current = true;
    console.warn(`[queue] Job ${job.id} processing for ${Math.round(processingDuration / 1000)}s, triggering cleanup`);
    fetch(`${SUPABASE_URL}/functions/v1/retry-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trigger: 'stuck-processing-retry' }),
    }).catch(() => {});
  }
}
```

This ensures that even if no new jobs are enqueued, a client viewing a stuck processing job will trigger the cleanup within ~5 minutes + one poll cycle (3s).

**File: `src/components/app/QueuePositionIndicator.tsx`**

Add a "stuck" state to the processing UI. If elapsed exceeds 5 minutes, show a message like "This is taking unusually long -- retrying..." instead of the normal overtime message, so the user knows the system is aware and acting.

In the `ProcessingState` component, add after the overtime message logic:

```typescript
const isStuck = elapsed > 300; // 5 minutes

// In the render:
{isStuck ? (
  <p className="text-sm font-medium text-foreground">
    This is taking unusually long -- retrying automatically...
  </p>
) : (
  <p className="text-sm font-medium text-foreground">
    {overtimeMsg || 'Generating your images...'}
  </p>
)}
```

### Summary

- 2 files modified
- No new dependencies
- Adds client-side timeout detection for `processing` jobs (mirrors existing `queued` stuck detection)
- Triggers server-side cleanup via `retry-queue` when a processing job exceeds 5 minutes
- Shows user-facing "retrying" message so users know the system is handling it
- Prevents jobs from being stuck indefinitely regardless of whether new jobs are enqueued
