

# Fix: GlobalGenerationBar showing stale video processing status

## Root Cause

The video generation flow has a **polling gap in bulk mode**:

1. Worker mode (`generate-video` edge function) submits the Kling task and returns — it does NOT wait for completion
2. Client-side polling (`useGenerateVideo`) tracks only ONE `activeJob` at a time
3. During bulk, `resetPipeline()` is called between each image, killing the previous job's Kling status polling
4. Result: `generation_queue` entries stay stuck as "processing" forever because no one polls Kling to discover completion and update the queue
5. The `recover` action fixes `generated_videos` but does NOT update corresponding `generation_queue` entries
6. GlobalGenerationBar queries `generation_queue` for `queued`/`processing` jobs → shows stale "Leo is creating your video" indefinitely

## Changes

### 1. Fix `generate-video` edge function — `recover` action
**File**: `supabase/functions/generate-video/index.ts`

After recovering stuck `generated_videos`, also find and complete stuck `generation_queue` entries:
- Query `generation_queue` for this user where `status = 'processing'` and `job_type = 'video'`
- For each, extract `kling_task_id` from the `result` JSON column
- Check if the corresponding `generated_videos` row is already `complete` or `failed`
- If complete → mark queue job as `completed` with the video URL in result
- If failed → mark queue job as `failed` and refund credits

### 2. Hide GlobalGenerationBar on video pages
**File**: `src/components/app/GlobalGenerationBar.tsx`

Add `/app/video` to `HIDDEN_PATHS`. The Video Hub already shows video results directly, and AnimateVideo has its own BulkProgressBanner — the GlobalGenerationBar showing duplicate/stale video info there is redundant and confusing.

### Files
- **Update**: `supabase/functions/generate-video/index.ts` — extend recover action to also resolve stuck queue entries
- **Update**: `src/components/app/GlobalGenerationBar.tsx` — add `/app/video` to HIDDEN_PATHS

