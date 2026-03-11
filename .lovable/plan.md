

## Fix: Never-Ending Generation & Missing Cancel Button

### Root Cause
Two bugs combine to create a stuck generation with no way out:

1. **Cancel is restricted to `queued` jobs only** — `useGenerationQueue.ts` line 349 has `activeJob.status !== 'queued'` guard, so `processing` jobs cannot be cancelled. The `QueuePositionIndicator` also only renders a Cancel button for the `queued` state.

2. **Stuck detection fires only once** — `retriggeredRef` is set to `true` after the first retry trigger and never resets, so if the cleanup didn't work the first time (e.g., `timeout_at` hasn't passed yet when retry fires at exactly 5 min), the job stays stuck forever with no further cleanup attempts.

3. **`cleanup_stale_jobs` only runs when `process-queue` is invoked** — there's no cron or periodic trigger, so if no new generation is enqueued, stale jobs sit indefinitely.

### Plan

**A. Allow cancelling processing jobs (`useGenerationQueue.ts`)**
- Remove the `activeJob.status !== 'queued'` guard — allow cancel for both `queued` and `processing` status
- For processing jobs, also call `refund_credits` RPC (or rely on existing cleanup to handle refund when status changes to `cancelled`)
- Actually: just update status to `cancelled` via PATCH — the backend cleanup can handle credit refund, or we do a simple edge function call

**B. Show cancel button during processing (`QueuePositionIndicator.tsx`)**
- Pass `onCancel` prop into `ProcessingState` component
- Render a Cancel button in the processing UI (after the progress bar)

**C. Fix stuck detection to retry periodically (`useGenerationQueue.ts`)**
- Instead of setting `retriggeredRef = true` once, use a timestamp and allow re-triggering every 60 seconds
- This ensures cleanup gets called multiple times until the job is resolved

**D. Add a forced timeout on the client side (`useGenerationQueue.ts`)**
- If a job has been processing for > 10 minutes, automatically set it to failed client-side and trigger cleanup
- This is a safety net for edge cases where server-side cleanup misses the job

### Files to Change

1. **`src/hooks/useGenerationQueue.ts`** — Allow cancel for processing jobs, fix retriggeredRef to allow periodic retries, add 10-min client-side timeout
2. **`src/components/app/QueuePositionIndicator.tsx`** — Pass onCancel to ProcessingState, show cancel button during processing

