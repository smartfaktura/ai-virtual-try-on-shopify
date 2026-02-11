

## Fixes Needed for the Priority Queue System

### Problem 1: Payload Shape Mismatch (Critical)

When `process-queue` forwards the `payload` JSONB to `generate-freestyle`, the generation function receives `undefined` for `imageCount`, `quality`, and `aspectRatio` because those values are sent as top-level params to `enqueue-generation` but never merged into the stored payload.

**Evidence**: The logs show `imageCount: undefined, quality: undefined, aspectRatio: undefined` when `generate-freestyle` processes the queued job. The stored payload is just `{"prompt": "test"}`.

**Fix**: In `enqueue-generation/index.ts`, merge `imageCount` and `quality` into the payload before storing it:
```typescript
const enrichedPayload = { ...payload, imageCount, quality };
```

This way when `process-queue` forwards `payload` to the generation function, all fields are present.

---

### Problem 2: Job Cancellation Doesn't Refund Credits

When a user cancels a queued job, the frontend PATCHes the status to `cancelled` via REST API, but no credits are refunded. The `refund_credits` function is never called.

**Fix**: Create a database trigger or modify the cancel flow to use a dedicated edge function endpoint that atomically sets status to `cancelled` AND calls `refund_credits`. A simpler approach: add a database trigger on `generation_queue` that fires when status changes to `cancelled` and refunds the `credits_reserved` amount.

```sql
CREATE OR REPLACE FUNCTION handle_queue_cancellation()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'queued' THEN
    PERFORM refund_credits(NEW.user_id, NEW.credits_reserved);
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_queue_cancel
  BEFORE UPDATE ON generation_queue
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status = 'queued')
  EXECUTE FUNCTION handle_queue_cancellation();
```

---

### Problem 3: Stuck Jobs Recovery

The test job `af3bcb45` is stuck in `processing` status. The `cleanup_stale_jobs` function exists but only runs when `process-queue` is triggered. If no new jobs come in, stuck jobs remain forever.

**Fix**: This is a known limitation acknowledged in the plan (pg_cron as safety net). For now, the stuck job should be cleaned up by manually triggering `process-queue` or waiting for the next enqueue. No code change needed, but we should ensure `cleanup_stale_jobs` runs at the start of every `process-queue` invocation (it already does -- line 36).

To clean up the current stuck job, we just need to call `process-queue` again since the 5-minute timeout has passed.

---

### Problem 4: Missing `enterprise` in Concurrent Limit

The `enqueue_generation` SQL function's CASE statement for `v_max_concurrent` doesn't include `enterprise`:

```sql
v_max_concurrent := CASE v_plan
  WHEN 'pro' THEN 4 WHEN 'growth' THEN 3
  WHEN 'starter' THEN 2 ELSE 1
END;
```

Enterprise users get max 1 concurrent job (falls to ELSE). Same issue exists in the edge function's RATE_LIMITS config which correctly has enterprise, but the SQL doesn't match.

**Fix**: Add enterprise to the CASE:
```sql
WHEN 'enterprise' THEN 6 WHEN 'pro' THEN 4 ...
```

---

### Problem 5: `enqueue_generation` Missing NULL Check for Plan

If a user_id doesn't exist in profiles, the SELECT returns NULL for both `v_plan` and `v_balance`. The function checks `v_balance < p_credits_cost` which with NULL always returns NULL (not true), so it proceeds to deduct credits from a non-existent row. It should check for NULL plan explicitly.

**Fix**: Already partially handled -- there's a `IF v_plan IS NULL THEN RETURN error` check. This is fine.

---

### Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/enqueue-generation/index.ts` | Merge `imageCount` and `quality` into payload before storing |
| SQL migration | Add cancellation trigger for automatic credit refund |
| SQL migration | Add `enterprise` to concurrent limit CASE in `enqueue_generation` |

### Implementation Order

1. Fix payload merge in `enqueue-generation` (most critical -- without this, no queued job works correctly)
2. Add cancellation refund trigger
3. Fix enterprise concurrent limit
4. Trigger `process-queue` to clean up the stuck test job

