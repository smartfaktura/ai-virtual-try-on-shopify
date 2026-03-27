

# Show Scroll Arrows on "Steal This Look" Category Bar

## Problem
The category bar in the Dashboard's "Steal This Look" section passes `hideArrows` prop, which hides the left/right scroll arrows. This makes it hard to navigate the horizontal category list.

## Change

### `src/components/app/DashboardDiscoverSection.tsx` (line 226)
- Remove the `hideArrows` prop from the `<DiscoverCategoryBar>` component
- The arrows will then appear automatically when the list is scrollable (using the existing `useScrollArrows` hook logic in `DiscoverCategoryBar`)

One line removed, no other files affected.

