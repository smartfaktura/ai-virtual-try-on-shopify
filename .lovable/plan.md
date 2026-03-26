

# Queue-Based Video Generation System

## Problem
Video generation currently uses a single-request flow: the client directly calls Kling API via `generate-video`, blocks further requests with "You already have a video processing", and relies on client-side polling of the Kling API. This breaks at scale and prevents users from submitting multiple videos.

## Architecture
Route video jobs through the **existing** `generation_queue` infrastructure (same as images): `enqueue-generation` → `generation_queue` table → `process-queue` → `generate-video` worker.

```text
Client                  Backend
──────                  ───────
startGeneration() ──→ enqueue-generation (jobType: "video")
                        ├── enqueue_generation() DB function
                        │   (atomic credit deduction + queue insert)
                        └── wake process-queue
                              └── claim_next_job()
                                   └── dispatch generate-video (worker mode)
                                        ├── call Kling API create
                                        ├── save kling_task_id to generation_queue.result
                                        └── start internal polling loop
                                             └── on complete: update generation_queue status
                                                  + insert generated_videos row

Client polls generation_queue (same as image jobs)
  └── UI shows: queued → processing → complete/failed
```

## Changes

### 1. Edge Function: `enqueue-generation/index.ts`
- Add `"video"` to `validJobTypes` array
- Add video credit cost calculation: use `estimateCredits` logic (10 for 5s, 18 for 10s, +4 ambient, +2 premium motion)

### 2. Edge Function: `process-queue/index.ts`
- Add `video: "generate-video"` to `JOB_TYPE_TO_FUNCTION` map

### 3. Edge Function: `generate-video/index.ts` (major refactor)
- Add **worker mode**: when request has `x-queue-internal` header + `job_id` in payload, run as queue worker instead of user-facing endpoint
- Worker mode flow:
  1. Extract params from payload (image_url, prompt, duration, etc.)
  2. Call Kling API to create task
  3. Save `kling_task_id` to `generation_queue.result`
  4. Poll Kling status in a loop (up to ~4 min within edge function timeout)
  5. On success: download video → upload to storage → insert `generated_videos` row → update `generation_queue` to `completed`
  6. On failure: update `generation_queue` to `failed` with error message, trigger credit refund
- Keep existing user-facing `action: "status"` and `action: "recover"` for backward compatibility
- Remove user-facing `action: "create"` (replaced by queue flow)

### 4. Hook: `src/hooks/useGenerateVideo.ts` (major rewrite)
- Remove client-side Kling polling entirely
- Remove "duplicate prevention" blocking logic
- Use `useGenerationQueue` with `jobTypes: ['video']` for queue polling
- New `startGeneration()`:
  1. Call `enqueue-generation` with `jobType: 'video'`, payload containing all video params
  2. Credit cost calculated via `estimateCredits()`
  3. Show toast: "Video queued — it will start automatically"
  4. Queue polling handles status updates automatically
- Expose `activeJob` from queue hook for UI status display
- Keep `history` fetching from `generated_videos` table
- Support multiple queued/processing videos by not blocking new submissions
- On job completion: refresh history, show success toast
- On job failure: show error toast with refund message

### 5. Hook: `src/hooks/useVideoProject.ts`
- Update `runAnimatePipeline` to pass video-specific params through the queue payload
- Remove direct `generateVideo.startGeneration()` call, use the new queue-based version
- Pipeline stages map to queue job status: `queued` → `processing` → `complete`/`failed`

### 6. UI: `src/pages/video/AnimateVideo.tsx`
- Show queue position and status from `activeJob` instead of single `videoStatus`
- Allow generating new videos even while one is processing (remove blocking)
- Show "Video queued" state with position indicator when job is queued
- Show "Generating..." state when job is processing
- Support viewing history of all videos (queued, processing, complete, failed)

### 7. DB Function: `cleanup_stale_jobs` (no change needed)
- Already handles stuck `processing` jobs with timeout — video jobs get the same protection automatically

## Credit Pricing for Video
```typescript
// In enqueue-generation
if (jobType === "video") {
  const dur = payload.duration || "5";
  const audio = payload.audioMode || "silent";
  const motion = payload.cameraMotion || "";
  let cost = dur === "10" ? 18 : 10;
  if (audio === "ambient") cost += 4;
  if (["product_orbit", "premium_handheld"].includes(motion)) cost += 2;
  return cost;
}
```

## Queue Statuses in UI
| Queue Status | UI Label | Behavior |
|---|---|---|
| `queued` | "Queued" | Show position, allow new submissions |
| `processing` | "Generating..." | Show elapsed time, allow new submissions |
| `completed` | "Complete" | Show in history with video player |
| `failed` | "Failed" | Show error, credits refunded message |

## What This Enables
- Users can submit multiple video generations without blocking
- Jobs survive page refresh (DB-driven, not client-session-driven)
- Same concurrency/priority/rate-limit infrastructure as image generation
- Stuck job recovery via existing `cleanup_stale_jobs`
- Admin visibility via existing `admin_generation_stats` (video jobs appear automatically)
- Scalable to 100+ concurrent users

## Files Modified
- `supabase/functions/enqueue-generation/index.ts` — add video job type + pricing
- `supabase/functions/process-queue/index.ts` — add video dispatch mapping
- `supabase/functions/generate-video/index.ts` — add worker mode, keep user-facing status/recover
- `src/hooks/useGenerateVideo.ts` — rewrite to use generation queue
- `src/hooks/useVideoProject.ts` — wire pipeline through queue
- `src/pages/video/AnimateVideo.tsx` — update UI for queue states

## No Migration Needed
Video jobs use the existing `generation_queue` table. Video-specific data (kling_task_id, video_url) is stored in `generation_queue.result` JSONB during processing, then persisted to `generated_videos` on completion.

