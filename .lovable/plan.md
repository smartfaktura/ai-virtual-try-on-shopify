## Root problem

`ievute040@gmail.com` currently has active stuck jobs:

- Freestyle job `56cd0b33-3786-4924-9f49-41ba65228bf2` is still `processing`
- Two newer Product Images jobs were also active, one queued and one processing

The cancel button is not failing because the frontend button is missing. It calls `cancel_queue_job`, but the database cancellation path is broken:

1. `generation_queue` has duplicate cancellation triggers: `trg_queue_cancel` and `trg_queue_cancellation`
2. Cancellation tries to refund credits by updating `profiles.credits_balance`
3. Billing protection triggers on `profiles` can block that credit update unless it is safely handled as a backend-owned operation
4. When the refund fails, the whole cancellation update rolls back, so the RPC returns false/error and the UI shows: “Could not cancel — generation may have already completed”

## Plan

1. **Fix cancellation at the database layer**
   - Replace the current `cancel_queue_job` implementation so cancellation and refund happen atomically inside the RPC
   - Remove duplicate queue cancellation triggers so credits cannot be refunded twice
   - Make the remaining cancellation path compatible with billing-field protection
   - Keep the security rule: users can only cancel their own queued/processing jobs

2. **Fix the frontend cancel error handling**
   - In `useGenerationQueue`, show the real cancellation error in logs
   - Keep the user-facing toast simple, but stop implying the generation completed when the real cause is a backend cancellation failure
   - After cancellation succeeds, clear the active job and refresh credits

3. **Unstick `ievute040@gmail.com` safely**
   - Cancel the stuck freestyle job and refund its reserved credits once
   - Inspect the active Product Images jobs for the same account and only cancel/refund jobs that are still genuinely stuck or user-requested stuck
   - Verify there are no remaining active jobs for that account on `/app/freestyle`

4. **Validate**
   - Query the queue row after cancellation to confirm status becomes `cancelled` with `completed_at`
   - Confirm credits are returned exactly once
   - Re-check the cancellation function path so the button now works for queued and processing jobs

## Technical notes

- This is a backend/RPC integrity fix, not a UI-only fix
- I will not add a per-minute scheduled job
- I will not change generation prompts, models, or Product Images logic
- I will only touch the queue cancellation/refund path and the small frontend cancel handler