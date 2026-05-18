# Talking Video — two real bugs found in the last two generations

I checked the last two Talking Video rows in the database and traced both failures end-to-end.

## What happened

### Job 1 — infinite "queued" (the loading one)

- **Row:** `bbbb8992…`, script "If you run a swimwear brand…" (119 chars, within the 120 limit)
- **Queue job:** `2cda8810…` → `failed` with `Dispatch rejected (500). Please try again.`
- **Cause:** `generate-talking-video` returned 500 to `process-queue` (Kling API rejected the request — likely because the script contains a curly apostrophe `'` and/or special chars that tripped validation; logs are already rotated so we can't see the exact reason).
- **Why it shows as "infinite loading":** `enqueue-generation` inserts a placeholder `generated_videos` row with `status='queued'` before dispatch. When dispatch fails, `process-queue` marks the **queue** job failed and refunds, but **nobody updates the placeholder**, so it stays `queued` forever and the Video Hub card spins indefinitely.

### Job 2 — "failed" (previously generated silently, this time disappeared)

- **Row:** `5f279313…`, script "hey its vov ai"
- **Result:** Base video **did generate successfully** — a silent .mp4 is sitting in storage at the saved URL. But `status='failed'`, `error_message='Timed out waiting for Kling result after 30 minutes'`.
- **Cause:** Stage 1 (base video) finished and was saved, but stage 2 (Kling lip-sync) never reached `stage='lipsync'` cleanly — metadata still shows `stage='base_video'` and `lipsync_task_id=null`. After 30 min, the poller's timeout branch only applies the silent-video fallback when `isLipsyncStage` is true. Anywhere else it just marks the row failed, throwing away the working silent base video.
- **Why the user previously got "successful but without sound":** exactly the silent fallback path — it used to fire correctly. Now the row gets into a state where the fallback condition doesn't match, so the user loses the video they paid for.

## What I'll change

### 1. `supabase/functions/process-queue/index.ts` — clean up the placeholder on dispatch failure
When `dispatchGenerationFunction` returns non-OK for a `talking_video` job, also update the placeholder `generated_videos` row (matched via `metadata->>queue_job_id = job.id`) to `status='failed'` with the same error message and `completed_at=now()`. This kills the infinite loading card and lets the Video Hub show a normal failed card.

### 2. `supabase/functions/poll-stuck-videos/index.ts` — fall back to silent video whenever `base_video_url` exists OR `video_url` is already set
Broaden the timeout fallback so it fires whenever a talking-video row has *any* usable base video URL (`meta.base_video_url` OR the row's `video_url`), not only when `isLipsyncStage` is true. On timeout for a talking-video row:
- If a base URL is available → mark `status='complete'`, set `video_url` to it, write `metadata.silent_fallback=true` + `lipsync_error='Lip-sync timed out'`, resolve the queue as completed, refund the 8 lip-sync credits.
- Only fall through to "mark failed" when there is genuinely no base video.

This recovers cases like Job 2 where stage 1 succeeded but the metadata transition to `lipsync` didn't land cleanly.

### 3. One-time cleanup for the two existing rows
- `bbbb8992…` → mark `status='failed'` with a clear error so the card stops spinning.
- `5f279313…` → flip to `status='complete'` using the existing `video_url`, set `metadata.silent_fallback=true`, refund 8 credits to the user.

Done via a SQL migration (or a direct one-shot update if you'd rather not migrate). No data is destroyed.

## Out of scope

- Not changing the Kling request body or the 120-char script limit.
- Not changing the Video Hub layout or the In Progress section.
- Not adding any new voice samples / preview audio (that was an earlier thread).

## Technical notes

- `enqueue-generation` already writes `metadata.queue_job_id = result.job_id` on the placeholder, so the dispatch-failure update can target it with `.filter("metadata->>queue_job_id", "eq", jobId)`.
- The 8-credit refund matches the existing `refund_credits` call in the lip-sync silent-fallback branches.
- No edge-function config or RLS changes required.

Reply "go" (or tweak any of the three steps) and I'll implement.
