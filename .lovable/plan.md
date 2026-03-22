

# Fix Category Bar Left Alignment

## Problem
The category bar doesn't align with the title/subtitle/grid because:
1. The outer `flex` container has `gap-1.5` — even when the left arrow collapses to `w-0`, the gap still reserves space
2. The left arrow element itself still occupies DOM space in the flex layout

## Changes

### `src/components/app/DiscoverCategoryBar.tsx` (line 52)
- Change `gap-1.5` to `gap-0` on the outer container
- Move the gap to only apply between the scroll area and the right arrow using `ml-1.5` on the right arrow button
- This ensures the scrollable pills start flush left when the left arrow is hidden

### Specifically:
- Line 52: `gap-1.5` → remove gap (or `gap-0`)
- Line 57-58: Add `ml-1.5` to the left arrow when visible (already has `w-0` when hidden, so no gap)
- Line 102-103: Add `ml-1.5` to the right arrow button

This is a 1-file, 3-line fix.

