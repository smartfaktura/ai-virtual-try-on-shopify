

## Root Cause: Credits Not Refunded on Cancel

### What happened

I traced your most recent cancel (job `09231917`) through the network logs:

1. Job was `processing` when you clicked Cancel
2. The PATCH succeeded — status changed to `cancelled` in the response
3. **But** the generation function (`generate-freestyle`) was still running and completed 27 seconds later, overwriting the status back to `completed`
4. The refund trigger **did fire** (the trigger handles `queued` → `cancelled` AND `processing` → `cancelled`)
5. **However**, the `completeQueueJob` function in the edge function then overwrote the status back to `completed` — the credits were refunded by the trigger, but then the job was marked `completed` (not `cancelled`), creating confusion

**The real bug is deeper**: The cancellation trigger fires and refunds credits correctly. But the generation edge function doesn't check if the job was cancelled before writing its results. So:
- Credits get refunded by the trigger ✓
- Then `completeQueueJob` overwrites status to `completed` ✗
- The UI sees `completed` and never shows "cancelled" feedback
- `onCreditRefresh` may not fire because the cancel response looked fine but the subsequent state is ambiguous

### Actually — let me verify the trigger condition more carefully

The trigger `trg_queue_cancel` has this WHEN clause:
```sql
WHEN (NEW.status = 'cancelled' AND OLD.status = 'queued')
```

**This is the bug.** The trigger only fires when `OLD.status = 'queued'`. When a job is in `processing` status and you cancel it, **the trigger does NOT fire** — no refund happens.

The function body handles both:
```sql
IF NEW.status = 'cancelled' AND OLD.status IN ('queued', 'processing') THEN
```
But the trigger's WHEN clause restricts it to only `queued`.

**Result**: Cancelling a `processing` job updates the status to `cancelled` but never refunds credits.

### Fix Plan

**1. Database migration — Fix the trigger WHEN clause**

Drop and recreate the trigger so it fires for both `queued` AND `processing` cancellations:

```sql
DROP TRIGGER IF EXISTS trg_queue_cancel ON generation_queue;

CREATE TRIGGER trg_queue_cancel
  BEFORE UPDATE ON generation_queue
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IN ('queued', 'processing'))
  EXECUTE FUNCTION handle_queue_cancellation();
```

**2. Edge functions — Check for cancellation before overwriting status**

In all three generation functions (`generate-freestyle`, `generate-tryon`, `generate-workflow`), the `completeQueueJob` function must check if the job was already cancelled before writing `completed`/`failed`. This prevents the race condition where the function finishes after the user cancelled:

```typescript
// Before updating, check current status
const { data: currentJob } = await supabase
  .from("generation_queue")
  .select("status")
  .eq("id", jobId)
  .single();

if (currentJob?.status === 'cancelled') {
  console.log(`[generate-*] Job ${jobId} was cancelled — skipping completion`);
  return;
}
```

**3. Frontend — already fixed** (the cancel logic with response verification is already in place from the previous implementation)

### Files to modify

| File | Change |
|---|---|
| Database migration | Fix trigger WHEN clause to include `processing` |
| `supabase/functions/generate-freestyle/index.ts` | Add cancellation check in `completeQueueJob` |
| `supabase/functions/generate-tryon/index.ts` | Add cancellation check in `completeQueueJob` |
| `supabase/functions/generate-workflow/index.ts` | Add cancellation check in `completeQueueJob` |
| `supabase/functions/upscale-worker/index.ts` | Add cancellation check before completion |

