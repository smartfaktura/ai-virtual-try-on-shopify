# Fix stale "In Progress" video cards on `/app/video`

## Root cause

The `In Progress` section reads from `history` filtered by `status === 'processing' || 'queued'`. New rows are inserted by the edge function with `status: 'processing'` and updated to `complete` once Kling finishes.

The frontend has three update paths, and **none of them reliably triggers a refresh the moment a video finishes**:

1. **Client-side Kling poll** (`useGenerateVideo.ts` line 132-170) — polls Kling, but on success (line 159: `if (data.status === 'succeed' && data.video_url) return;`) it just exits. It never calls `silentRefreshHistory()`, so the local `history` state still shows the row as `processing` until something else triggers a refresh.

2. **Background interval** (line 348-355) — refreshes every 8s **only while** `history.some(v => v.status === 'processing')`. This works in theory but:
   - Has up to 8s latency.
   - The poll only tracks one `activeJob` at a time (the latest enqueue), so when the user kicks off 2 videos, only one gets the immediate Kling status check; the other relies entirely on the interval.

3. **Window focus** — fires on tab focus only.

Result: a video can be `complete` in the DB and visible as a finished card in the grid below, while the same row still appears in "In Progress" because the local state hasn't been refreshed yet.

There's also a smaller defensive issue: even if there's a transient state where the same `kling_task_id` somehow appears twice (e.g. a stale optimistic insert), the merge dedup would catch it, but the UI doesn't guard against showing a "processing" row whose `kling_task_id` already has a `complete` sibling.

## Fix

**File: `src/hooks/useGenerateVideo.ts`**

1. **Trigger an immediate refresh when the client-side Kling poll detects success or failure.** Replace the bare `return` after success/failure with a call that schedules `silentRefreshHistory()` (with a tiny delay so the edge function's DB update has landed):
   ```ts
   if (data.status === 'succeed' && data.video_url) {
     setTimeout(() => silentRefreshHistory(), 1500);
     return;
   }
   if (data.status === 'failed') {
     setTimeout(() => silentRefreshHistory(), 1500);
     return;
   }
   ```

2. **Tighten the background poll cadence from 8s → 4s** while any video is processing. This bounds the worst-case stale window to ~4s for cases the active-job poll can't catch (e.g. a second concurrent job).

3. **Add a "processing watchdog"**: if a row has been `processing` for more than 6 minutes (Kling pro mode rarely exceeds 4-5 min), call `recoverStuckVideos` automatically — it already exists, just isn't re-invoked after mount.

**File: `src/pages/VideoHub.tsx`**

4. **Defensive UI guard**: when computing `processingVideos`, exclude any row whose `kling_task_id` already has a sibling row with `status === 'complete'`. This way, even if the local state is briefly stale, the user never sees a duplicate showing as "Processing" while the finished version sits in the grid below:
   ```ts
   const completedTaskIds = new Set(
     history
       .filter(v => v.status === 'complete' && v.kling_task_id)
       .map(v => v.kling_task_id),
   );
   const processingVideos = history.filter(v =>
     (v.status === 'processing' || v.status === 'queued') &&
     !(v.kling_task_id && completedTaskIds.has(v.kling_task_id))
   );
   ```

## Files to edit

- `src/hooks/useGenerateVideo.ts` — immediate refresh on Kling success/failure, 4s interval, watchdog.
- `src/pages/VideoHub.tsx` — defensive filter so completed videos can't appear in "In Progress".
