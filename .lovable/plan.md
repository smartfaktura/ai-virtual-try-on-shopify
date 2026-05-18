## Goal

On `/app/video` (Video Hub), put the **In Progress** strip at the very top of the page so users don't scroll past workflow cards + showcase to see what's generating. Also stop showing stale "processing" rows that have been stuck for days/weeks (the database currently has rows from April still marked `processing`, which is what's causing the bogus second "in progress" card in the screenshot — the genuine job is 1m 34s, the stale one shows 8m 43s but is actually weeks old; the elapsed timer only looks recent because of how progress is capped).

## Changes (all in `src/pages/VideoHub.tsx`)

1. **Reorder sections.** New top-down order:
   - `PageHeader`
   - **In Progress** strip (only rendered when there's at least one *fresh* processing job)
   - Workflow cards grid
   - Showcase
   - Completed Videos
   
   The In Progress block already exists at the bottom — move its JSX to render right after `PageHeader`. Keep the same card component, same live tick, same dedup-by-`kling_task_id` logic.

2. **Filter stale rows out of In Progress.** Add a freshness guard to the existing `processingVideos` filter:
   - Drop any row whose `created_at` is older than ~30 minutes. Kling jobs that haven't finished by then are stuck/abandoned, not in progress.
   - Concretely: `Date.now() - new Date(v.created_at).getTime() < 30 * 60 * 1000`.
   - This keeps the genuine 1m 34s job visible and hides the bogus 8m 43s one (which is really a weeks-old row).
   - Stale rows still appear in **Completed Videos** as they do today (the `completedVideos` filter already includes anything not currently `processing`/`queued`, so we'll mirror the same freshness rule there — stale processing rows fall through into the completed grid where the user can dismiss them, instead of disappearing entirely).

3. **No backend changes.** Not auto-failing the old rows in the DB in this pass — the user asked for the UI to stop showing them as in-progress, not for a queue janitor. We can add a cleanup migration later if desired.

## Out of scope

- No changes to `process-queue`, `generate-talking-video`, or any edge function.
- No changes to the Talking Video waiting page.
- No design refresh of the cards themselves.

## Technical notes

- File touched: `src/pages/VideoHub.tsx` only.
- `hasProcessing` (drives the 1s tick) should use the same freshness-filtered list so the timer stops ticking once only stale rows remain.
- Keep the existing dedup that hides a `processing` row when a sibling `complete` row exists with the same `kling_task_id`.
