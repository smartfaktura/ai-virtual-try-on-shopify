
Issue confirmed. This is not you doing anything wrong.

What I verified
1. I checked your account data directly (`info@tsimkus.lt` / user `fe45fd27...`).
2. Your freestyle jobs are completing in the queue with image URLs saved in `generation_queue.result.images`.
3. But several completed jobs are missing corresponding rows in `freestyle_generations` (the table used by Freestyle/Library galleries).
4. For your account, 9 recent completed freestyle jobs are missing from `freestyle_generations` (including multiple candle-sand jobs), which explains why only ~2 recent ones appear.
5. Product selection itself is not the root cause; it correlates because these runs were high-quality product-image jobs that hit fallback behavior more often.

Do I know what the issue is?
Yes.

Root cause in code
- In `supabase/functions/generate-freestyle/index.ts`:
  - Normal success path inserts into `freestyle_generations`.
  - 429 fallback success path uploads image and marks queue complete, but does not insert into `freestyle_generations`.
- So jobs can be “completed” but invisible in Library/Freestyle views.

Implementation plan
1) Fix persistence path in backend function
- File: `supabase/functions/generate-freestyle/index.ts`
- Add one shared helper (e.g. `persistFreestyleRow(...)`) that inserts `user_id, image_url, prompt, aspect_ratio, quality, model_id, scene_id, product_id, workflow_label`.
- Call this helper from:
  - primary success path
  - 429 fallback success path
- Add structured logs with `job_id` + `image_url` for insert success/failure.

2) Add final safety reconciliation before queue completion
- In `completeQueueJob(...)`, before writing `status='completed'`, verify each output URL has a `freestyle_generations` row for that user.
- Insert missing rows idempotently.
- This prevents future silent data loss if any other branch misses insertion.

3) Backfill missing rows (so your missing images appear)
- Add a migration to insert missing freestyle rows from completed queue jobs:
  - source: `generation_queue` where `job_type='freestyle' and status='completed'`
  - image from `result.images`
  - metadata from `payload` (`prompt`, `aspectRatio`, `quality`, optional ids/label)
  - dedupe by `(user_id, image_url)` via `NOT EXISTS`
- Add unique index on `(user_id, image_url)` for idempotency and duplicate protection.

4) UX hardening (small but important)
- File: `src/pages/Freestyle.tsx`
- If queue reports completed but refreshed gallery has no new image yet, show explicit toast/banner (“Generation finished, syncing to library…”) instead of silent confusion.
- Keep current refresh flow, but add clear feedback path.

Validation plan
1. Run backfill and confirm your missing recent job IDs now exist in `freestyle_generations`.
2. Generate again with same flow (selected product + high quality) and verify it appears in:
   - `/app/freestyle`
   - `/app/library`
3. Confirm no duplicates after repeated backfill/fix runs.
4. Confirm queue-completed jobs now always map to visible library records.

Expected result after implementation
- Your previously “completed but missing” generations become visible.
- New generations no longer disappear after refresh.
- No dependency on manual retries or lucky non-fallback runs.
