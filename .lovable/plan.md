

## Fix: Workflow Generation Stuck When One Image Fails

### What Happened
Your "Selfie / UGC Set — Iced Matcha Latte" job generated 2/3 images successfully, then the 3rd image ("Car Selfie") hung. The edge function was killed by the platform runtime limit before it could finish, so `completeQueueJob` was never called. The job is now stuck in "processing" with `timeout_at` expired. The `cleanup_stale_jobs` function will mark it as "failed" on the next queue cycle — but that discards the 2 good images and refunds all credits.

### Root Cause
Two issues:
1. **No graceful partial completion** — if the edge function is killed mid-loop, all progress is lost
2. **`cleanup_stale_jobs` treats stuck jobs as fully failed** — it refunds everything instead of saving partial results

### Plan

**1. Save partial results on timeout cleanup** (`cleanup_stale_jobs` DB function)
- Before marking a stuck job as "failed", check if `result.generatedCount > 0`
- If partial images exist, mark as "completed" with a `partial_success` flag instead of "failed"
- Only refund credits for the images that were NOT generated (proportional refund)
- If no images were generated, keep current behavior (full refund + failed status)

**2. Add wall-clock guard in the generation loop** (`generate-workflow/index.ts`)
- Track function start time at the top of the handler
- Before each image generation attempt, check remaining time (e.g., if < 30s left of a ~150s budget, break the loop)
- If the loop breaks early, call `completeQueueJob` with whatever images were generated so far
- This prevents the platform from killing the function without cleanup

**3. Per-image result persistence** (`generate-workflow/index.ts`)
- The progress updates (line 1022-1032) already write `generatedCount` to the queue row
- Enhance this to also write the `images` array so far, so even if the function dies, `cleanup_stale_jobs` has access to the actual image URLs
- This makes the partial-completion logic in step 1 work correctly

### Files Changed
- `supabase/functions/generate-workflow/index.ts` — wall-clock guard + persist images array in progress updates
- DB migration — update `cleanup_stale_jobs` to handle partial results

### Immediate Fix for Your Stuck Job
I will also manually complete the stuck job with its 2 generated images via a one-time migration so you don't lose the results.

### Technical Details

Wall-clock guard in the generation loop:
```typescript
const FUNCTION_START = Date.now();
const MAX_WALL_CLOCK_MS = 140_000; // 140s safe limit

// Inside the loop, before each image:
if (Date.now() - FUNCTION_START > MAX_WALL_CLOCK_MS) {
  console.warn(`[generate-workflow] Wall-clock limit approaching, breaking after ${images.length}/${totalToGenerate} images`);
  break; // Falls through to completeQueueJob with partial results
}
```

Updated `cleanup_stale_jobs` partial completion logic:
```sql
-- Instead of always marking as 'failed':
IF (v_stale.result IS NOT NULL AND (v_stale.result->>'generatedCount')::int > 0) THEN
  -- Partial success: save what we have, refund only ungenerated portion
  UPDATE generation_queue SET status = 'completed', completed_at = now() WHERE id = v_stale.id;
  v_refund := (v_stale.credits_reserved / (v_stale.result->>'requestedCount')::int) 
              * ((v_stale.result->>'requestedCount')::int - (v_stale.result->>'generatedCount')::int);
ELSE
  -- Full failure
  UPDATE generation_queue SET status = 'failed', ... WHERE id = v_stale.id;
  v_refund := v_stale.credits_reserved;
END IF;
```

