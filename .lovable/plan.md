

## Fix Stuck Jobs + Prevent Future Stuck States

### Immediate Problem

Two "Ziedas su deimantais" jobs are stuck in PROCESSING with expired timeouts. The `cleanup_stale_jobs` DB function exists and correctly refunds credits, but it only runs when `process-queue` is triggered. Nothing is triggering it right now because:

1. The Workflows page polls the queue table directly but never calls `cleanup_stale_jobs`
2. The `useGenerationQueue` hook's 5-minute watchdog only works for jobs it is actively tracking (from the Generate page)
3. There is no periodic/cron trigger for `process-queue`

### Solution: Two-Part Fix

**Part 1: Add a "Cancel" button to stuck activity rows**

Give the user a way to manually cancel stuck processing jobs from the Workflows page. When clicked, it will call the cleanup function and refund credits.

| File | Change |
|------|--------|
| `src/components/app/WorkflowActivityCard.tsx` | Add a "Cancel" button on processing jobs that have been running for more than 3 minutes. When clicked, call a new cancel handler. |
| `src/pages/Workflows.tsx` | Add a cancel handler that updates the job status to `failed` with message "Cancelled by user", refunds credits via `refund_credits` RPC, and invalidates queries. |

**Part 2: Auto-cleanup on Workflows page poll cycle**

When the Workflows page detects processing jobs past their `timeout_at`, trigger the `retry-queue` edge function to force a `process-queue` run (which calls `cleanup_stale_jobs`). This mirrors the existing watchdog in `useGenerationQueue` but works for the Workflows page context.

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | In the active jobs query callback, if any processing job has `started_at` older than 5 minutes, auto-trigger `retry-queue` once. This forces `cleanup_stale_jobs` to run and mark them as failed with credits refunded. |

### How Credits Get Refunded

The existing `cleanup_stale_jobs` function already handles refunds:
1. Finds all PROCESSING jobs where `timeout_at < now()`
2. Sets status to `failed` with error message "Timed out after 5 minutes"
3. Adds `credits_reserved` back to the user's `credits_balance`

The cancel button will do the same thing inline for immediate feedback.

### User Experience Flow

```text
Job processing > 3 min:
  [Workflow generation -- Ziedas su deimantais]  PROCESSING  [Cancel]
  
User clicks Cancel:
  -> Job marked failed, credits refunded immediately
  -> Toast: "Generation cancelled. 32 credits refunded."
  -> Row moves to failed section

Auto-cleanup (no user action needed):
  -> Workflows page detects job past timeout
  -> Triggers cleanup automatically  
  -> Job appears as FAILED with "Timed out" message
  -> Credits already refunded by DB function
```

### Technical Details

- Cancel button appears only on PROCESSING jobs older than 3 minutes (not on QUEUED jobs, which already have cancel support in useGenerationQueue)
- The cancel uses the existing REST API pattern (PATCH to generation_queue) plus the `refund_credits` RPC
- Auto-cleanup trigger fires at most once per page session to avoid spamming
- The `timeout_at` column is already queried but not selected in the current Workflows query -- we need to add it to the select

