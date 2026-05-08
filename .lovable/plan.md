
## Problem

The `cancel_queue_job` RPC function sets the job status to `cancelled` but **does not refund credits**. The toast says "credits returned" but that's misleading — credits are lost on cancel.

Additionally, looking at the screenshot, the user clicked cancel multiple times getting "Could not cancel — generation may have already completed" — this happens because after the first cancel attempt succeeds (sets status to `cancelled`), the local `activeJob` still shows `processing`, so subsequent clicks hit the RPC again which returns `false` (status is now `cancelled`, not in `('queued', 'processing')`).

## Fix

### 1. Update `cancel_queue_job` RPC to refund credits
Add credit refund logic to the database function so cancelled jobs return credits to the user's balance.

```sql
CREATE OR REPLACE FUNCTION cancel_queue_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_credits integer;
BEGIN
  UPDATE generation_queue
  SET status = 'cancelled', completed_at = now()
  WHERE id = p_job_id
    AND user_id = auth.uid()
    AND status IN ('queued', 'processing')
  RETURNING user_id, credits_reserved INTO v_user_id, v_credits;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_credits > 0 THEN
    UPDATE profiles
    SET credits_balance = credits_balance + v_credits
    WHERE user_id = v_user_id;
  END IF;

  RETURN true;
END;
$$;
```

### 2. Prevent duplicate cancel clicks (frontend)
In `src/hooks/useGenerationQueue.ts`, add a guard so the cancel function can't be called while already in-flight — preventing the repeated "Could not cancel" toasts.

No cron jobs, no complex changes — just fix the cancel to actually work.
