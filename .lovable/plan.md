# Server-side video poller — fix the 22 orphans + prevent recurrence

## Problem recap

Today 22 videos are stuck `status='processing'` with a valid `kling_task_id` and no error. The `generate-video` worker submits to Kling then relies on the **browser tab** to poll for completion. If the user closes the tab → row is orphaned forever, queue job never resolves, credits never refunded if Kling actually failed.

There's already a per-user `recover` action inside `generate-video`, but it requires a logged-in user calling it. We need a server-side, all-user version on a schedule.

## Build steps

### 1. New edge function: `poll-stuck-videos`

No auth (cron-only). Service-role client. Single entry point with no body required.

Logic:
1. Select up to 100 rows from `generated_videos` where `status='processing'` AND `kling_task_id IS NOT NULL` AND `created_at > now() - interval '24 hours'`.
2. For each row, build the Kling status URL based on `model_name`:
   - `kling-v3-omni` → `/videos/omni-video/{task_id}`
   - everything else → `/videos/image2video/{task_id}`
3. Call Kling with the same JWT helper used in `generate-video`.
4. Branch on `task_status`:
   - **succeed** → download the video + cover, save to `generated-videos` bucket using existing `saveVideoToStorage` pattern (`{userId}/{taskId}.mp4` and `{userId}/{taskId}_preview.jpg`), update row to `status='complete'` + `video_url` + `preview_url` + `completed_at`. Then update the matching `generation_queue` row (lookup by `result->>kling_task_id`) to `status='completed'`.
   - **failed** → update row `status='failed'` + `error_message` + `completed_at`. Refund credits via `refund_credits(user_id, credits_reserved)` RPC by reading the matching queue row, then mark queue row `status='failed'`.
   - **submitted / processing** → leave as-is, will retry next cron tick.
5. Separate sweep: rows older than `30 minutes` still in `processing` → mark `status='failed'` with error `"Timed out waiting for Kling result"`, refund credits, fail queue row.
6. Concurrency-safe: use `Promise.all` on Kling polls (Kling status endpoint is cheap), DB writes are per-row idempotent.
7. Return `{ checked, completed, failed, timed_out }` JSON for cron logs.

Reuses code patterns already in `supabase/functions/generate-video/index.ts` (JWT helper, save helpers, queue resolution block at lines 673–730) — copied/adapted, not imported.

### 2. pg_cron schedule

Insert (via the user-data insert tool, not migration) a `cron.schedule` calling the function every minute:
- name: `poll-stuck-videos-every-minute`
- schedule: `* * * * *`
- body: `net.http_post` to `/functions/v1/poll-stuck-videos` with the anon key as `apikey` header.

### 3. One-shot backfill

After the function deploys, call it once via `supabase--curl_edge_functions` to immediately resolve the 22 stuck rows from today (Kling keeps results ~14 days so they should still be retrievable). No separate backfill script needed — the same poller works.

## Out of scope

- No client-side changes (the browser polling stays as-is for fast UX when tab is open; the cron is the safety net).
- No retry/re-submit logic — if Kling failed, we surface failure + refund, we don't re-submit.
- No changes to the content-moderation failures (those are correctly failing with the Kling error message; UX wording is a separate task).

## Verification

After deploy:
1. Curl `poll-stuck-videos` once → expect 22 checked, mix of completed/failed/still-processing.
2. Re-query `generated_videos` for today → expect zero rows in `processing` for jobs >30min old.
3. Re-query `generation_queue` for video jobs → no orphaned `processing` rows.
4. Check edge function logs for any per-row errors.
