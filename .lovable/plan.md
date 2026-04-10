
Fix Library pagination so recent freestyle images are not skipped

What I found
- The Library feed is built in `src/hooks/useLibraryItems.ts`.
- It fetches workflow jobs and freestyle rows separately, merges them, sorts by `created_at`, then slices to 20 items.
- In your current data, several workflow jobs are actually newer than the latest freestyle rows, so freestyle will not always be on the very first screen.
- But there is also a real bug: if a source is fetched but none of its items make the current 20-item page, the hook still advances that source cursor. That means unseen freestyle items can get skipped entirely on later pages.
- The same bug can also skip leftover images from a multi-image workflow job if the page boundary cuts through that job.

Plan
1. Rework `useLibraryItems` pagination
   - Add a carry-forward buffer for overflow items.
   - After merging and sorting, keep everything after the first 20 as pending for the next page instead of dropping it.
   - This prevents fetched-but-unrendered freestyle images from disappearing.

2. Fix cursor advancement
   - Advance source cursors only for rows fetched from the database while preserving unrendered items in the overflow buffer.
   - Do not move a source past items that have not been surfaced yet.

3. Fix completion flags
   - Update `jobsDone` / `fsDone` so a source is only marked done when it is exhausted and has no pending overflow items left.

4. Refresh Library after freestyle saves
   - In `src/hooks/useFreestyleImages.ts`, also invalidate the Library query after save/delete so new freestyle images show up immediately when opening Library.

Files to change
- `src/hooks/useLibraryItems.ts` — main pagination fix
- `src/hooks/useFreestyleImages.ts` — refresh hardening

Verification
- Generate new freestyle images while recent workflow images also exist.
- Open `/app/library` with `Newest` + `All`.
- Confirm:
  - newest ordering stays correct,
  - recent freestyle images are no longer skipped,
  - later pages contain the right next items,
  - multi-image workflow jobs do not lose images at page boundaries,
  - the `Freestyle` filter still works.
