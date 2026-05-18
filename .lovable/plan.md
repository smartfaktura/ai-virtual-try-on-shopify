## Root cause: queue job timed out and got auto-retried mid-pipeline

The Talking Video pipeline is two Kling stages (base video ~5–15 min, then lip-sync ~5–15 min) — easily 20–30 minutes end to end. But the underlying queue job uses a generic 5-minute timeout, so the cleanup cron killed the job while it was still legitimately running.

Forensic trace for the affected row (`5f279313…`):

- 07:34 — queue created, `generate-talking-video` dispatched, base video task submitted.
- ~07:45 — `cleanup_stale_jobs` saw `generation_queue.timeout_at` (started_at + **5 min**) elapsed, no partial results → **auto-retry** (`retry_count: 0 → 1`, status back to `queued`).
- ~07:50 — `process-queue` re-dispatched `generate-talking-video` for the same job. This stomped the `generated_videos` row back to `status='processing'` with a **new** base-video `kling_task_id`, wiping any in-flight stage-1 state.
- Meanwhile the original base video finished. `poll-stuck-videos` submitted lip-sync (task `885271263831916599`) and updated metadata to `stage='lipsync'`. But the queue's `result.stage` was never updated, so cleanup still saw the job as stale.
- 08:40 — second attempt also hit the 5-min cutoff. `retry_count` was already 1 → full failure: queue marked `failed` ("Timed out after retry (attempt 2)") with **no refund to the generated_videos row**.
- The lip-sync video on Kling's side likely did complete, but by then `poll-stuck-videos` had already passed its own `TIMEOUT_MIN=30` cutoff (measured from row `created_at`, not from when lip-sync was submitted) and triggered the silent fallback — which is what you saw.
- The manual repair I did last turn locked in that silent fallback. So the video you're watching is the base Kling clip with no audio, exactly because the lip-sync result was thrown away.

There are three independent bugs feeding into this:

1. **`generation_queue.timeout_at` is hard-coded to 5 minutes in `claim_next_job`** — fine for image jobs, fatal for talking_video.
2. **`cleanup_stale_jobs` retries any "stale" queue job** — including talking_video jobs that are still legitimately running on Kling. Each retry re-dispatches `generate-talking-video` and corrupts the row.
3. **`poll-stuck-videos.TIMEOUT_MIN` is measured from `created_at`** — so the cutoff fires mid-lip-sync even when stage 2 is healthy. And the queue's `result.stage` is never advanced to `lipsync`, so cleanup can't tell the job is making progress.

## Plan

### 1. Give talking_video a realistic queue timeout

Edit `public.claim_next_job` (migration):

- When the claimed job's `job_type = 'talking_video'`, set `timeout_at = now() + interval '45 minutes'`.
- All other job types keep the existing 5-minute timeout.

### 2. Stop auto-retrying talking_video jobs

Edit `public.cleanup_stale_jobs` (migration):

- Skip `job_type = 'talking_video'` entirely — let `poll-stuck-videos` own the lifecycle for these (it already has the right semantics: silent fallback, partial refund, completion).
- Existing behavior for image jobs is unchanged.

### 3. Keep the queue's stage marker in sync (`supabase/functions/poll-stuck-videos/index.ts`)

When stage 1 finishes and stage 2 (lip-sync) is submitted, also update the matching `generation_queue` row's `result` to `{ kling_task_id: <lipsync task>, stage: 'lipsync' }` and bump `timeout_at` to `now() + interval '45 minutes'`. This way even if rule #2 is bypassed by a future change, cleanup sees a fresh deadline.

### 4. Measure the silent-fallback cutoff from the right starting point (`poll-stuck-videos`)

- Track lip-sync submission time in metadata as `lipsync_started_at` (set when stage-2 is submitted).
- When deciding whether to time out and silent-fall-back, compare against `max(row.created_at, lipsync_started_at) + TIMEOUT_MIN` instead of `row.created_at + TIMEOUT_MIN`.
- Bump `TIMEOUT_MIN` from 30 → 45 minutes so a healthy stage 2 isn't killed early.

### 5. Guard `generate-talking-video` against re-dispatch on a non-queued row

Defensive only — to make sure a future bug can't cause the same corruption:

- Before doing any work, fetch the matching `generated_videos` row via `metadata->>queue_job_id`. If `status` is already `complete` or `failed`, exit early (mark queue completed, no refund) instead of stomping the row.

### 6. Repair the specific affected job

One-time SQL (service-role migration) for row `5f279313-051f-4eaa-938e-3b06d24d8063`:

- Re-check Kling task `885271263831916599` (the lip-sync task) directly. If Kling still has the lip-synced result, swap `video_url` to the lip-synced file, clear `silent_fallback`, set `metadata.stage='complete'`, and **reverse the 8-credit silent-fallback refund** (since the user is getting the full product).
- If Kling no longer has the result available, leave the silent fallback in place but credit back the full 8 lip-sync credits (already done) and surface a clearer message in the Video Hub card ("Voiceover failed — silent version delivered").

The Kling lookup will happen inside the migration via an edge-function call, since it requires Kling API credentials.

### Out of scope

- No UI changes to Video Hub.
- No changes to image/freestyle queue paths.
- Don't touch `enqueue-generation` — the bug is downstream of enqueue.

### Files touched

- `supabase/migrations/<new>.sql` — `claim_next_job`, `cleanup_stale_jobs`, repair for `5f279313…`.
- `supabase/functions/poll-stuck-videos/index.ts` — queue stage sync, `lipsync_started_at`, bumped `TIMEOUT_MIN`.
- `supabase/functions/generate-talking-video/index.ts` — early-exit guard for completed/failed rows.
