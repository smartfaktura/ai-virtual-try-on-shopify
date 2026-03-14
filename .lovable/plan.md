

## Why Cancelled Jobs Still Appear in Library

### Root Cause

The cancellation guard in `completeQueueJob` (line 639) correctly prevents the queue status from being overwritten to `completed`. However, the actual image records are saved to the `freestyle_generations` table **inside the generation loop** (line 929), one at a time, as each image finishes generating. By the time `completeQueueJob` checks for cancellation, the images are already persisted in the database and visible in the library.

```text
Timeline of a cancelled job:

1. User clicks Cancel → queue status set to 'cancelled'
2. Edge function is still running...
3. Image 1 generated → saved to freestyle_generations ← ALREADY IN LIBRARY
4. Image 2 generated → saved to freestyle_generations ← ALREADY IN LIBRARY
5. completeQueueJob() → sees 'cancelled' → skips status update ✓
   But the images are already saved ✗
```

### Fix

Two changes needed in `supabase/functions/generate-freestyle/index.ts`:

**1. Check cancellation before each image save (inside the loop)**

Before inserting into `freestyle_generations` at line 924, query the queue job status. If it's `cancelled`, skip the DB insert, delete the uploaded storage file, and break the loop.

```typescript
// Before saving to freestyle_generations, check if cancelled
if (isQueueInternal && body.job_id) {
  const { data: jobCheck } = await supabase
    .from('generation_queue')
    .select('status')
    .eq('id', body.job_id)
    .single();
  if (jobCheck?.status === 'cancelled') {
    console.log(`[generate-freestyle] Job ${body.job_id} cancelled — skipping save, breaking loop`);
    break;
  }
}
```

**2. Clean up already-saved images on cancellation in `completeQueueJob`**

When `completeQueueJob` detects `cancelled` status (line 639), delete any `freestyle_generations` rows that were inserted during this job's run. We can identify them by matching `user_id` + `image_url` from the `images` array passed to the function.

```typescript
if (currentJob?.status === "cancelled") {
  // Clean up any freestyle_generations rows saved during this cancelled run
  if (images.length > 0) {
    await supabase
      .from("freestyle_generations")
      .delete()
      .eq("user_id", userId)
      .in("image_url", images);
    console.log(`[generate-freestyle] Cleaned up ${images.length} freestyle_generations for cancelled job ${jobId}`);
  }
  return;
}
```

### Files to modify

| File | Change |
|---|---|
| `supabase/functions/generate-freestyle/index.ts` | Add cancellation check before each image save in the loop (line ~924); add cleanup of saved rows in `completeQueueJob` cancellation guard (line ~639) |

