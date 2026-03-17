
Goal: Fix the Product Listing Set workflow so cancel works reliably, progress shows “generated/total images,” and stuck jobs self-recover without misleading toasts.

What I found (root cause)
- Your two Product Listing queue jobs were stuck in `processing` and later auto-marked `failed` with `Timed out after 5 minutes`:
  - `1a0cada5-698d-4259-836e-10d6765648a1`
  - `23623046-b062-49b5-9c71-bb192ff6a83a`
- Both jobs actually generated partial output (2 images each) in storage, but the queue row had `result = null`, so UI could not show progress.
- Cancel from Workflows is currently broken by logic mismatch:
  - UI tries to update status to `failed` (not `cancelled`).
  - If that fails, it calls `retry-queue`, but `retry-queue` exits early when there are no queued jobs.
  - UI still shows success toast + manual refund, so users see “cancelled/refunded” while cards stay processing.
- `generate-workflow` has no per-request timeout and no in-flight progress writes, so long provider latency can leave jobs appearing stuck and not show “x/y”.

Implementation plan
1) Fix cancellation path (immediate user-visible fix)
- File: `src/pages/Workflows.tsx`
- Change cancel update from `status: 'failed'` to `status: 'cancelled'`.
- Remove manual `refund_credits` call from client (refund should stay server-driven via cancellation trigger).
- Show success toast only when DB update actually returns cancelled row.
- If cancelling multiple stuck jobs in one card, show one consolidated toast (avoid duplicate toasts).

2) Make retry endpoint actually recover stuck processing jobs
- File: `supabase/functions/retry-queue/index.ts`
- Remove “must have queued jobs” gate.
- Always trigger `process-queue`, because `process-queue` already runs `cleanup_stale_jobs` first.
- Return structured response (`cleanup_triggered`, `process_status`) for better debugging.

3) Add real progress metadata for workflow jobs
- File: `supabase/functions/generate-workflow/index.ts`
- After each successfully generated image, update queue row `result` with:
  - `generatedCount`
  - `requestedCount`
  - `currentLabel`
- Also refresh `timeout_at` heartbeat on each progress update to avoid false stale cleanup while work is actively progressing.

4) Make workflow generation resilient to long provider hangs
- File: `supabase/functions/generate-workflow/index.ts`
- Add `AbortSignal.timeout(...)` to AI calls.
- Add bounded retry strategy with shorter retries and a global per-job deadline guard.
- On deadline/timeout, finalize queue row via `completeQueueJob` with partial success instead of leaving stale processing.

5) Show “x of y images” correctly in Activity cards
- Files:
  - `src/pages/Workflows.tsx`
  - `src/lib/batchGrouping.ts`
  - `src/components/app/WorkflowActivityCard.tsx`
- Include `result` in active job query mapping.
- Derive total from `payload.imageCount` / `result.requestedCount`.
- Derive generated from `result.generatedCount` (fallback 0).
- Update active/completed/failed card labels and progress bar to use image units (not queue-row count), so single workflow job with 3 images displays `2/3`, `3/3`, etc.

6) Improve stuck cleanup re-trigger behavior on the page
- File: `src/pages/Workflows.tsx`
- Replace one-time `autoCleanupTriggeredRef` with a throttled “stuck signature” check, so newly stuck jobs can trigger cleanup again in the same session.
- Add a manual Activity refresh button to force refetch of queue + failures + credits when user wants immediate sync.

Technical details
- No schema migration is required for core fix (existing queue JSON `result` is enough).
- Existing cancellation policy already supports updating queued/processing jobs to `cancelled`; UI just needs to use the correct status.
- This removes the current misleading state where toast says cancelled/refunded but card remains processing.
- This also prevents client-side double-refund behavior by eliminating direct client refund RPC from Workflows cancel flow.

Validation checklist after implementation
- Cancel a stuck Product Listing job → status changes to `cancelled` quickly, card leaves active section, one correct toast.
- Start 3-image Product Listing run → Activity shows `0/3 → 1/3 → 2/3 → 3/3`.
- If one variation hangs, job ends with partial result/failure state and never lingers forever in `processing`.
- Retry/cleanup works even when user has no queued jobs (only stale processing jobs).
