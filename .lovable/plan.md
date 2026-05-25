## Problem

Current `/app/video` order is: **In Progress → Workflow Cards → Showcase → Completed Videos**.

That works for first-time visitors but feels wrong the moment a user has real work — their own videos sit below ten autoplaying showcase clips, and during generation the "waiting" and "completed" states are visually disconnected.

## New layout logic

`VideoHub.tsx` already computes `processingVideos` and `completedVideos`. We use those to switch layouts:

**New user (no processing, no completed):**
1. Page header
2. Workflow Cards (Animate, Start & End, etc.)
3. Showcase (the 10 autoplay clips — "see what's possible")

**Returning user (has any processing OR completed video):**
1. Page header
2. **In Progress** (if any)
3. **Completed Videos** (with Select / Load More)
4. Workflow Cards (still accessible for starting a new one)
5. *Showcase hidden* — they've seen what's possible, they're making their own

So as soon as the first generation finishes (or even starts), Showcase disappears and Completed jumps directly under In Progress — matching the natural flow: *waiting → done → make another*.

## Implementation

Single file: `src/pages/VideoHub.tsx`.

- Add `const hasOwnVideos = processingVideos.length > 0 || completedVideos.length > 0;`
- Wrap the Showcase block in `{!hasOwnVideos && (...)}`
- Reorder the JSX so In Progress + Completed render before Workflow Cards when `hasOwnVideos` is true. For new users, Workflow Cards + Showcase render in their current order.
- Keep the empty-state card (the dashed "No videos yet…" box) — but it only ever shows for new users now, so it can be removed since Showcase covers that role. Cleaner: drop the empty-state, let Showcase be the empty state.

No changes to data fetching, the realtime tick, select mode, bulk download, or the `RecentVideoCard` component.

## Out of scope

- No DB / RLS / edge function changes
- No restyle of cards themselves
- Showcase clips stay as-is (we just conditionally render them)
