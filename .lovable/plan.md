# Shorter stage labels + fix stuck talking videos

## A. Shorter labels on video cards (`src/pages/VideoHub.tsx`)

1. `talkingStageLabel()`:
   - `base_video` → **Motion** (was "Generating motion")
   - `lipsync` → **Lip-sync** (was "Lip-syncing voice")
   - `complete` → **Finishing** (was "Finalizing")
2. Remove the **"Source frame"** badge at top-left of the processing card — it's redundant (the source frame is literally what's shown), and competes with the stage badge.
3. In `src/components/app/video/TalkingVideoGenerating.tsx` (the full-page generating view) keep the longer headings — that screen has space. No change there.

## B. Stuck talking videos in `/app/video`

Database check confirms two talking videos are stuck:
- `cfe2264f…` — stage `lipsync`, started 12:34 UTC, **timeout_at already passed (13:28 UTC)**, no `lipsync_task_id` written to queue result.
- `639de233…` — stage `base_video`, started 12:41 UTC, timeout 13:26, similar pattern.

The `poll-stuck-videos` cron is supposed to either finish or fail+refund these. It isn't reconciling them because:
- The queue row has `status='processing'` past `timeout_at`, but talking-video jobs are excluded from `cleanup_stale_jobs` (intentional, by design — it says "owned by poll-stuck-videos").
- `poll-stuck-videos` looks for talking jobs by `metadata->>'queue_job_id'` but only acts while it can still talk to Kling. If a Kling task disappears or returns an unexpected payload, the row stays in limbo.

### Fixes (server-side)

1. **Add a hard backstop in `poll-stuck-videos`**: any talking job where `queue.started_at < now() - interval '40 minutes'` AND no `lipsync_task_id` recorded → mark queue `failed`, refund credits, mark `generated_videos` row `failed` with `error_message = 'Lip-sync stage timed out'`. (Lip-sync alone should never take >15 min; 40 min is a safe ceiling.)
2. **Persist `lipsync_task_id` immediately** when we kick off the lip-sync call (today it's only saved on success in some paths) so we always have a recovery handle.
3. **Reconcile-now button**: add a tiny admin/owner endpoint `reconcile-talking-video?id=…` that the frontend can call from the video card's overflow menu for any talking video stuck > 25 min. It re-queries Kling and either finalizes or fails+refunds. (Optional but unblocks users without waiting for cron.)

### Frontend touch (`VideoHub.tsx` only)

4. When a processing talking video's `elapsedSec > expected * 1.6` (≈ 20 min), add a small **"Stuck? Refresh status"** link inside the card that triggers the reconcile endpoint, then refetches the list. No new component — inline button next to the elapsed pill.

### One-time cleanup

5. Manually fail+refund the two currently stuck rows so the user's `/app/video` stops showing them as in-progress. Single migration with two `UPDATE` statements + credit refund via `refund_credits()`.

## Files touched

- `src/pages/VideoHub.tsx` — labels + remove Source frame badge + optional reconcile link
- `supabase/functions/poll-stuck-videos/index.ts` — 40-min backstop + always-persist `lipsync_task_id`
- `supabase/functions/generate-talking-video/index.ts` — minor: always write `lipsync_task_id` when dispatched (if applicable)
- New: `supabase/functions/reconcile-talking-video/index.ts` (small, optional)
- Migration to clear the two stuck rows + refund credits

## Out of scope

- Lip-sync quality improvements from previous plan (separate ticket).
- Audio download button (already shipped).
