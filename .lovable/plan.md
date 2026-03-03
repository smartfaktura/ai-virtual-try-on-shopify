

## Fix: Content-Blocked Generations Should Show Blocked Card, Not Generic Error

### Problem
When content is blocked by safety filters, the backend marks the queue job as generic "failed" (with message "Failed to generate any images"). The `contentBlocked` flag is only returned in the HTTP response — but the queue-based flow reads from the `generation_queue` table, where this info is lost. So the UI shows a red toast instead of the styled `ContentBlockedCard` with the "Rephrase" button.

Credits ARE already refunded on failure — that part works correctly.

### Root Cause
In `supabase/functions/generate-freestyle/index.ts`, `completeQueueJob()` (line 556) is called before the content-blocked check. It sees `images.length === 0` and writes `status: "failed"` with a generic error message. The `contentBlocked` and `blockReason` fields never make it into the queue record's `result` column.

### Fix — 2 changes in 1 file

**`supabase/functions/generate-freestyle/index.ts`**

1. **Pass `contentBlocked` and `blockReason` into `completeQueueJob()`** — add two new parameters to the function signature.

2. **Inside `completeQueueJob()`**, when `generatedCount === 0` AND content was blocked:
   - Set `status: "completed"` (not "failed") with `result: { images: [], contentBlocked: true, blockReason, generatedCount: 0, requestedCount }`
   - Still refund credits (user shouldn't pay for blocked content)
   - This way the Freestyle UI picks up `contentBlocked` from the result and renders the `ContentBlockedCard`

3. **At the call site** (line 823), pass `contentBlocked` and `blockReason` as additional arguments.

No frontend changes needed — `Freestyle.tsx` already checks `result?.contentBlocked` and renders the blocked card correctly.

