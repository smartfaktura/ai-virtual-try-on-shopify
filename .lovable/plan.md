## Problem found

Cancel is failing because the deployed `cancel_queue_job` function calls `set_config('role', 'service_role', true)` inside a `SECURITY DEFINER` function. PostgreSQL rejects that with:

```text
cannot set parameter "role" within security-definer function
```

So the cancel request never reaches the queue update/refund path. The active stuck job for `ievute040@gmail.com` is:

```text
e58ac3b7-2e7f-4f72-a73b-33488ea97330 / freestyle / processing / 6 credits
```

## Plan

1. **Replace the broken database cancellation function**
   - Remove the invalid `set_config('role', 'service_role', true)` call
   - Rewrite `cancel_queue_job` so it:
     - verifies the authenticated user owns the job
     - locks the queue row
     - only cancels `queued` or `processing` jobs
     - marks the job `cancelled` and sets `completed_at`
     - refunds `credits_reserved` exactly once in the same transaction
   - Prevent double refunds by only refunding when the previous status was active

2. **Make backend-owned credit updates pass billing protection safely**
   - Update the billing protection trigger to allow trusted `SECURITY DEFINER` RPC functions (`refund_credits`, `deduct_credits`, `enqueue_generation`, `cancel_queue_job`) to update `credits_balance`
   - Keep blocking direct user edits to billing fields

3. **Disable trigger-based cancellation refund to avoid duplicate logic**
   - Remove the `generation_queue` cancellation trigger or make it no-op
   - Keep cancellation/refund logic centralized in `cancel_queue_job`

4. **Unstick the current user’s job**
   - After the migration is approved and applied, cancel job `e58ac3b7-2e7f-4f72-a73b-33488ea97330`
   - Confirm status is `cancelled`, `completed_at` is set, and 6 credits are returned once

5. **Validate in the browser signal**
   - Confirm `cancel_queue_job` no longer returns 403
   - Confirm the Freestyle active job UI clears after cancel