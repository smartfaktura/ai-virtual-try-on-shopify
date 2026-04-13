

# Fix Slow Freestyle Multi-Image Generation

## Problem
When you select 4 images in Freestyle, all 4 are generated **sequentially** inside a single edge function call. Each Pro-quality image takes ~30-40 seconds, so 4 images takes ~120-200 seconds total. The `timeout_at` is only 3 minutes, causing `cleanup_stale_jobs` to sometimes re-queue the job mid-execution, leading to even longer waits (233s in your screenshot).

Workflows already solve this by splitting multi-image requests into **parallel 1-image jobs**. Freestyle should do the same.

## Solution
Split freestyle multi-image requests into parallel jobs at enqueue time (frontend), not at generation time (backend). This matches the existing workflow pattern.

### 1. Frontend: Enqueue N parallel jobs instead of 1 (`src/pages/Freestyle.tsx`)
When `variationCount > 1`, call `enqueue()` N times in a loop (each with `imageCount: 1`), sharing a common `batch_id`. Each job costs `perImageCost × 1` credits. This lets process-queue dispatch them to separate edge function instances that run concurrently.

### 2. Frontend: Track batch of jobs (`src/hooks/useGenerationQueue.ts`)
When a batch is active, poll all jobs in that batch instead of a single job. Show progress as "2 of 4 done" etc. Mark the batch complete when all jobs finish.

### 3. Backend: Extend `timeout_at` appropriately (`supabase/functions/generate-freestyle/index.ts`)
Since each job now generates only 1 image, the 3-minute timeout is plenty. No change needed here — the existing code already handles `imageCount: 1` perfectly.

### 4. Frontend: Batch progress in QueuePositionIndicator (`src/components/app/QueuePositionIndicator.tsx`)
Update the processing UI to show batch progress when multiple jobs are active (e.g., "Generating image 2 of 4...").

## Changes

### `src/pages/Freestyle.tsx`
- In `handleGenerate`, when `variationCount > 1`: generate a `batch_id`, loop and call `enqueue()` for each image with `imageCount: 1` and the shared `batch_id`
- Pass `batch_id` to the queue hook so it can track the full batch

### `src/hooks/useGenerationQueue.ts`
- Add batch tracking: when `batch_id` is set, poll all jobs with that batch_id
- Aggregate batch status: "processing" if any are processing, "completed" when all done
- Expose batch progress (completedCount / totalCount)

### `src/components/app/QueuePositionIndicator.tsx`
- Show "Generating image 2 of 4..." during batch processing
- Adjust time estimates for single-image jobs (much shorter per image)

### `supabase/functions/generate-freestyle/index.ts`
- No changes needed — it already handles `imageCount: 1` correctly

## Expected Result
4 freestyle images will generate in **parallel** (~30-40s total instead of ~120-200s), matching the speed of workflow generation. Each image dispatches to its own edge function instance through process-queue's 1-second stagger.

## Technical Notes
- The `batch_id` pattern already exists in the codebase (used by workflows via `useGenerationBatch`)
- `process-queue` already dispatches jobs with 1-second stagger to avoid thundering herd
- Credit reservation happens per-job at enqueue time, so partial failures refund correctly
- The `enqueue-generation` edge function already accepts `batch_id` in the payload

