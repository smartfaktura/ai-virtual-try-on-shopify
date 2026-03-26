

# Fix: Stuck Generation — Client Never Re-triggers Cleanup

## Root Cause

The edge function crashed at ~2.5 minutes due to a Deno `TimeoutError` (signal timed out), which killed the process before it could update the queue job status. The job stayed `processing` forever because:

1. The job's `timeout_at` is 10 minutes from creation
2. The client detects "stuck processing" at 5 minutes and triggers `retry-queue` → `process-queue` → `cleanup_stale_jobs`
3. But at 5 minutes, `timeout_at` hasn't passed yet — cleanup ignores the job
4. `retriggeredRef.current = true` prevents **any further retrigger attempts**
5. The job stays stuck indefinitely — no server or client recovery fires again

## Fix

**File**: `src/hooks/useGenerationQueue.ts` (lines 279-323)

### Change 1: Allow periodic re-triggers instead of one-shot

Replace the single `retriggeredRef.current` boolean with a **timestamp-based approach**. Allow re-triggering every 60 seconds (not just once) so that when the job eventually passes `timeout_at`, the next cleanup call actually catches it.

### Change 2: Client-side hard timeout at 10 minutes

If a job has been processing for >10 minutes (matching the server's `timeout_at` window), the client should:
- Trigger one final cleanup call
- After 30 more seconds, if still stuck, force the job to `failed` status locally and call the user's `onGenerationFailed` callback
- This ensures the user is never stuck indefinitely

### Implementation sketch

```typescript
// Line ~280: Replace one-shot retrigger with periodic
if (job.status === 'processing' && job.started_at) {
  const processingDuration = Date.now() - new Date(job.started_at).getTime();
  const CLEANUP_INTERVAL = 60_000; // Re-trigger every 60s
  const HARD_TIMEOUT = 10 * 60 * 1000; // 10 min

  // Periodic cleanup trigger (every 60s after 5 min)
  if (processingDuration > 5 * 60 * 1000) {
    const lastTrigger = lastCleanupTriggerRef.current || 0;
    if (Date.now() - lastTrigger > CLEANUP_INTERVAL) {
      lastCleanupTriggerRef.current = Date.now();
      fetch(...retry-queue...).catch(() => {});
    }
  }

  // Hard client timeout: force-fail after 10 min
  if (processingDuration > HARD_TIMEOUT) {
    // Check images one more time, then force-complete or force-fail
    const syntheticJob = { ...job, status: 'failed', error_message: 'Generation timed out' };
    setActiveJob(prev => ({ ...syntheticJob, generationMeta: prev?.generationMeta }));
    handleTerminalJob(syntheticJob);
    onCreditRefresh?.();
    return;
  }
}
```

### Change 3: Replace `retriggeredRef` with `lastCleanupTriggerRef`

Replace `const retriggeredRef = useRef(false)` with `const lastCleanupTriggerRef = useRef(0)` (a timestamp). Reset it to 0 when a new job starts, not `false`. This also fixes the "queued stuck" detection at line 247 to use the same periodic pattern.

## Files Modified
- `src/hooks/useGenerationQueue.ts` — periodic cleanup re-trigger + hard client timeout

