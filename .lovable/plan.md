

# Replace Load More with View All, Remove Header View All

## Changes

### `src/components/app/DashboardDiscoverSection.tsx`

1. **Remove "View all" button from header** (lines 198-205): Remove the `<Button>` next to the title/subtitle so the header is just title + subtitle.

2. **Replace "Load more" with "View all"** (lines 230-236): Replace the `Load more` button with a `View all` button that navigates to `/app/discover`. Remove the `hasMore` condition — always show the button. Remove `visibleCount` state and related logic since we no longer paginate; just show first 16 items always.

3. **Clean up**: Remove `visibleCount` state, the `useEffect` reset, and the `hasMore` variable. Keep `filtered.slice(0, 16)` as a simple constant.

### File
- `src/components/app/DashboardDiscoverSection.tsx`

