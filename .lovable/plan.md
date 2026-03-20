

# Fix Team Page Images Not Showing on Mobile

## Root Cause
The `useStaggeredReveal` hook observes the **entire grid container** with `threshold: 0.15`. On mobile, the grid is single-column (`grid-cols-1`), making the container ~5000px tall. 15% of that is ~750px — which can exceed the viewport height. The observer never triggers, so all cards remain `opacity: 0`.

## Fix
**File:** `src/pages/Team.tsx` (line 37)

Change `threshold: 0.15` to `threshold: 0.05`. This means only 5% of the container needs to be visible (~250px), which will reliably trigger on mobile as soon as the user scrolls to the grid.

Single line change — no other files affected.

