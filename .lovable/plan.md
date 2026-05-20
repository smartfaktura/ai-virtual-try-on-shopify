## Goal

On `/app/video`, surface any in-progress (processing/queued) videos as the **very first section** so users immediately see the work currently running, instead of having to scroll past workflow cards and the showcase.

## Current order

1. PageHeader ("Create Videos")
2. Workflow cards grid (Animate Image, Start & End, Short Film, etc.)
3. Showcase grid
4. **In Progress** (only when something is processing) ← buried
5. Completed Videos

## New order

1. PageHeader
2. **In Progress** strip — rendered immediately under the header, only when `processingVideos.length > 0`
3. Workflow cards grid
4. Showcase
5. Completed Videos

## Implementation (single file)

`src/pages/VideoHub.tsx`

- Lift the `completedTaskIds` / `processingVideos` / `completedVideos` computation out of the IIFE at line 367 to the top of the component body so it can be referenced in two places.
- Render the existing **In Progress** block (lines 383–406, unchanged markup: amber pulse dot, "In Progress" h2, count badge, 2/4-col grid of `RecentVideoCard` with `nowTick`) directly after `<PageHeader>` (after line 297), gated on `processingVideos.length > 0`.
- Remove the In Progress block from inside the bottom IIFE; that section keeps only **Completed Videos**.
- Keep all existing behavior: live `nowTick` timer, dedup against completed `kling_task_id`s, recently-completed highlight, select mode, ZIP download, pagination.

No styling, copy, or data-fetching changes. No other files touched.

## Why this is safe

- Pure reordering of already-rendered JSX.
- The `hasProcessing` / `nowTick` effect (lines 208–214) already drives the timer regardless of where the block is mounted.
- Completed-grid logic, select mode, and download flow stay inside the bottom section untouched.
