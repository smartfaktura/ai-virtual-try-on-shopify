
Fix video status desync, duplicate “processing” cards, and refresh flashing

What is actually wrong
1. The Video Hub history hook is reloading too aggressively:
   - `useGenerateVideo.ts` sets `isLoadingHistory=true` on every 8s poll and focus refresh, so the grid visibly flashes.
   - It fetches history first, then runs recovery, so stale “processing” rows render briefly before the corrected state arrives.

2. Pagination is using the wrong offset:
   - `loadMore()` uses `history.length` as the backend offset.
   - But `history` is deduplicated client-side, so the rendered length is smaller than the number of rows already fetched.
   - Result: overlapping pages get fetched, older rows come back, and stale “processing” entries can win over newer completed ones.

3. Deduping keeps the wrong version:
   - Current dedupe keeps the first row for a `kling_task_id`.
   - If page 1 contains an older `processing` row and a later page contains the completed version, the stale row stays and the good row gets dropped.

4. Animate mounts duplicate video state managers:
   - `AnimateVideo.tsx` uses `useVideoProject()`.
   - `useBulkVideoProject.ts` also creates its own `useVideoProject()`.
   - That means duplicate history polling/recovery work, which makes the app feel like it is constantly refreshing.

5. The floating “Leo is creating…” state is queue-driven:
   - For bulk video jobs, the floating progress UI reads active queue records.
   - If queue reconciliation lags behind completed video records, the floating status can keep saying “creating” even after videos are already ready.

Implementation plan

1. Stabilize Video Hub history in `src/hooks/useGenerateVideo.ts`
   - Split “initial/manual loading” from “background refresh”.
   - Keep skeleton/loading UI only for first load or explicit refresh, not for the recurring 8s poll.
   - Convert polling/focus refresh into silent updates so the page stops flashing.

2. Fix pagination so “Load More” never overlaps
   - Track a real backend offset (`nextOffset` or `fetchedRowCount`) instead of using `history.length`.
   - Always advance by raw rows fetched from the backend, not by deduplicated card count.
   - This prevents old rows from re-entering after clicking Load More.

3. Replace the current dedupe with a merge strategy that prefers the best row
   - Group by stable identity (`kling_task_id`, fallback to row `id`).
   - Keep the strongest/latest state for each video:
     - prefer `complete` with a real `video_url`
     - then `failed`
     - then `processing`
     - then `queued`
   - Use timestamps (`completed_at` / `created_at`) as tie-breakers.
   - Re-sort the final merged list newest-first.

4. Stop double-refresh loops on Animate
   - Refactor `src/hooks/useBulkVideoProject.ts` so it does not create its own nested `useVideoProject()`.
   - Make bulk mode reuse the parent video project/generation state from `AnimateVideo.tsx`, or pass in only the actions it needs.
   - This removes duplicate polling/recovery intervals and cuts down the “page is refreshing all the time” feeling.

5. Tighten queue/video reconciliation for the floating progress UI
   - Ensure completed video records also clear matching active queue records before the next UI paint cycle.
   - Prefer doing this in the existing backend recovery flow and then invalidating/refetching the global progress query once.
   - If needed, add a guarded recovery trigger for active video queue groups so “Leo is creating…” disappears as soon as jobs are actually done.

Files to update
- `src/hooks/useGenerateVideo.ts`
- `src/hooks/useBulkVideoProject.ts`
- `src/pages/video/AnimateVideo.tsx`
- `src/components/app/GlobalGenerationBar.tsx`
- `supabase/functions/generate-video/index.ts` (only if the existing recovery path needs stronger queue/video synchronization)

Technical details
- No database schema or RLS change is needed; this is a state sync + pagination issue.
- The main bug is not the labels themselves — it is stale row selection and overlapping pagination.
- The flashing is primarily caused by background polls reusing the full-page loading state.
- The floating progress bug is primarily caused by queue records not being reconciled fast enough against completed video records.

Verification
1. Start a multi-video batch.
2. Stay on Animate, then open Video Hub.
3. Confirm the grid no longer flashes every few seconds.
4. Confirm completed videos never revert to “Processing”.
5. Confirm clicking Load More does not reintroduce stale duplicates.
6. Confirm the floating “Leo is creating…” state disappears once the videos are actually finished.
