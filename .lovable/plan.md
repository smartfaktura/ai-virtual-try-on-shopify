

## Plan: Fix "stuck generating" when images are already saved

### Root Cause
The edge function saves images to `freestyle_generations` (line 1044) BEFORE updating `generation_queue` status to `completed` (line 737). If the status update fails silently — or the edge function times out between saving the image and updating the queue — the UI stays in "generating" state indefinitely while the image is already visible in Library.

The queue status update has **no error handling**:
```typescript
await supabase.from("generation_queue").update({
  status: "completed", result, completed_at: ...
}).eq("id", jobId);
// no .throwOnError() or error check
```

### Changes

#### 1. `supabase/functions/generate-freestyle/index.ts` — Add error handling + retry on queue update

In `completeQueueJob` (~line 737), add error checking and a single retry on the queue status update:

```typescript
const { error: updateError } = await supabase.from("generation_queue").update({
  status: "completed",
  result,
  completed_at: new Date().toISOString(),
}).eq("id", jobId);

if (updateError) {
  console.error(`[generate-freestyle] Queue update failed for ${jobId}:`, updateError.message);
  // Retry once
  const { error: retryError } = await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);
  if (retryError) {
    console.error(`[generate-freestyle] Queue update retry also failed for ${jobId}:`, retryError.message);
  }
}
```

Apply the same pattern to the content-blocked update (~line 703) and the failed update (~line 709).

#### 2. `src/hooks/useGenerationQueue.ts` — Add staleness detection

Add a safety mechanism in the polling loop: if a job has been `processing` for longer than 5 minutes AND no status change has occurred, force-check the `freestyle_generations` table. If images exist for the current user created after the job started, auto-complete the job client-side:

In `runPoll` (~line 260-300), after detecting `processing` status for > 5 minutes (the existing `retriggeredRef` block), add a check that queries `freestyle_generations` for images created after `job.started_at`. If found, call `handleTerminalJob` with a synthetic completed status to clear the banner.

#### 3. `src/pages/Freestyle.tsx` — Add image-arrival detection during processing

Add a secondary effect: when `isProcessing` is true, set up a 30-second interval that calls `refreshImages()`. If new images appear while the job is still processing (matching timing), auto-reset the queue state. This handles the case where the edge function saved images but the queue update never happened.

### Impact
- Prevents indefinite "stuck generating" banners
- Adds resilience with retry on queue status updates
- Self-heals the UI if the backend fails to update the queue

