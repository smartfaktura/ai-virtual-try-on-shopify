

# Fix Bulk Video Generation UX — Batch as Single Unit

## Problem

When bulk-generating videos, each image is enqueued individually via `useBulkVideoProject` → `useVideoProject.runAnimatePipeline` → `useGenerateVideo.startGeneration`. This causes:

1. **Individual toast per image** — "Video queued — it will start automatically" fires N times
2. **Individual `generation_queue` entries without a shared `batch_id`** — the `batchGrouping.ts` fallback time-window grouping may or may not merge them, and even when it does, the GlobalGenerationBar shows separate "Leo is creating your video" cards
3. **`resetPipeline()` called between images** — clears the previous job's polling, causing stale state

## Solution

Refactor `useBulkVideoProject` to enqueue all jobs as a proper batch (shared `batch_id`) and suppress per-image toasts/pipeline resets during bulk mode.

### Changes

### 1. `src/hooks/useBulkVideoProject.ts` — Direct enqueue with batch_id

Instead of calling `videoProject.runAnimatePipeline()` per image (which fires toasts, resets state, creates projects), refactor to:

- Generate a single `batch_id = crypto.randomUUID()` for the entire bulk run
- For each image: create the `video_project`, `video_input`, `video_shot` records directly (same logic as `useVideoProject.runAnimatePipeline`)
- Call `enqueueWithRetry()` directly with `batch_id` in the payload, using `paceDelay()` between calls
- Send a single `sendWake()` after all jobs are enqueued
- Show only ONE summary toast at the end ("7 videos queued successfully")
- No `resetPipeline()` between images

### 2. `src/hooks/useGenerateVideo.ts` — Accept `isBulk` flag

Add an optional `isBulk` parameter to `startGeneration()`:
- When `isBulk === true`, suppress the "Video queued" toast
- This prevents N individual toasts when called from bulk flow

### 3. `src/lib/batchGrouping.ts` — Already supports `batch_id`

No changes needed — the grouping logic already handles `batch_id` in its first pass, which will correctly merge all bulk video jobs into a single `BatchGroup` in the GlobalGenerationBar.

### 4. `src/components/app/GlobalGenerationBar.tsx` — Video batch display

Update the video branch in the expanded detail view:
- When a video `BatchGroup` has `totalCount > 1`, show "Leo is creating N videos" instead of "Leo is creating your video"
- Show progress as `completedCount/totalCount done`

### Files
- **Update**: `src/hooks/useBulkVideoProject.ts` — enqueue directly with shared batch_id, no per-image pipeline resets/toasts
- **Update**: `src/hooks/useGenerateVideo.ts` — add `isBulk` param to suppress toast
- **Update**: `src/components/app/GlobalGenerationBar.tsx` — pluralize video batch display

