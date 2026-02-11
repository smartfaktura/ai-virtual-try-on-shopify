## if Fix: Freestyle Results Not Appearing (Server-Side Save)

### Root Cause

The "namo banana" sweater generation **completed successfully** -- the AI generated an image and it was stored as base64 in the queue result (~4MB). But the image never appeared in your library because:

1. The queue stores the raw base64 image data in `generation_queue.result`
2. The frontend has to poll that result (downloading ~4MB of JSON), then re-upload the image to storage, then insert a database row
3. This client-side save is fragile -- if you navigate away, if the network hiccups on the large download, or if there's any interruption, the image is lost forever

Other generation types (product, try-on) don't have this problem because `process-queue` saves their results server-side.

### Fix

Make `process-queue` save freestyle results to storage and the `freestyle_generations` table **server-side**, just like it already does for other job types. The frontend then only needs to refresh the list -- no more downloading 4MB base64 blobs.

### Changes

#### 1. `supabase/functions/process-queue/index.ts`

Update the freestyle handling block (currently skipped with `if (jobType !== 'freestyle')`) to:

- Take each base64 image from the result
- Upload it to the `freestyle-images` storage bucket
- Get the public URL
- Insert a row into `freestyle_generations` with the image URL, prompt, aspect ratio, quality, and product/model/scene IDs from the payload

```text
Current code:
  // Save to generation_jobs for library (skip freestyle -- it saves to freestyle_generations separately)
  if (jobType !== 'freestyle' && generatedCount > 0) { ... }

New code:
  if (jobType === 'freestyle' && generatedCount > 0) {
    // Save each image to storage + DB (server-side)
    for (const base64Image of (result.images || [])) {
      const fileId = crypto.randomUUID();
      const filePath = `${userId}/${fileId}.png`;
      // Convert base64 to binary, upload to freestyle-images bucket
      // Get public URL
      // Insert into freestyle_generations table
    }
  } else if (jobType !== 'freestyle' && generatedCount > 0) {
    // existing generation_jobs insert (unchanged)
  }
```

#### 2. `src/pages/Freestyle.tsx`

Update the queue completion handler (lines 300-336) to:

- Stop trying to download and re-upload base64 images
- Instead, just refresh the freestyle images list from the database
- The images are already saved server-side by process-queue

```text
Current:
  saveImages(result.images, { ... })  // Downloads 4MB base64, re-uploads

New:
  // Images already saved server-side, just refresh the list
  refreshImages();
```

#### 3. `src/hooks/useFreestyleImages.ts`

Add a `refresh` function that re-fetches from the database so the Freestyle page can call it after queue completion.

#### 4. `src/hooks/useGenerationQueue.ts`

Stop fetching the `result` column for freestyle jobs (it contains the massive base64 data). Instead, just check the `status` field. When status is `completed`, the frontend knows the images are already saved.

Alternatively, strip large image data from the result before storing it in the queue (store only metadata like `generatedCount` and `contentBlocked`).

### Summary


| Before                                                           | After                                   |
| ---------------------------------------------------------------- | --------------------------------------- |
| 4MB base64 stored in queue, frontend must download and re-upload | Images saved to storage server-side     |
| Lost if user navigates away                                      | Always saved regardless of user actions |
| Slow (double transfer: server to client to server)               | Fast (saved once, server-side)          |
| Fragile                                                          | Reliable                                |


### Files Changed


| File                                        | Change                                                               |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `supabase/functions/process-queue/index.ts` | Add freestyle storage upload + DB insert                             |
| `src/pages/Freestyle.tsx`                   | Replace `saveImages()` with `refreshImages()` on queue completion    |
| `src/hooks/useFreestyleImages.ts`           | Add `refresh` function                                               |
| `src/hooks/useGenerationQueue.ts`           | Optionally skip fetching large `result` for completed freestyle jobs |
