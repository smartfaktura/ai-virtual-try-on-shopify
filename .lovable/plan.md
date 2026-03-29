

# Fix: Restrict generation_queue UPDATE to status-only via security definer function

## Problem

The UPDATE policy on `generation_queue` allows users to cancel their own jobs (`status → 'cancelled'`), but doesn't restrict *which columns* can be changed. A malicious client could craft an UPDATE that also modifies `user_plan`, `priority_score`, or `credits_reserved` while setting status to `cancelled` — potentially gaming the refund trigger or priority system.

## Solution

Replace the permissive UPDATE policy with a security definer function that only changes `status` to `cancelled`. The existing `handle_queue_cancellation` trigger already handles the refund logic, so the function just needs to do a targeted UPDATE.

## Changes

### 1. Database migration

```sql
-- Drop the permissive UPDATE policy
DROP POLICY "Users can cancel their own jobs" ON public.generation_queue;

-- Create a secure cancel function
CREATE OR REPLACE FUNCTION public.cancel_queue_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_found boolean;
BEGIN
  UPDATE generation_queue
  SET status = 'cancelled'
  WHERE id = p_job_id
    AND user_id = auth.uid()
    AND status IN ('queued', 'processing')
  RETURNING true INTO v_found;

  RETURN COALESCE(v_found, false);
END;
$$;
```

### 2. Client code update

Update `src/pages/Workflows.tsx` to call the new RPC function instead of a direct `.update()`:

```typescript
// Before:
const { data, error } = await supabase
  .from('generation_queue')
  .update({ status: 'cancelled' })
  .eq('id', jobId)
  .select('id');

// After:
const { data, error } = await supabase.rpc('cancel_queue_job', { p_job_id: jobId });
```

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop UPDATE policy, create `cancel_queue_job` security definer function |
| 2 | Update Workflows.tsx | Use `supabase.rpc('cancel_queue_job')` instead of direct UPDATE |

