

# Fix Dashboard Discover: Match Images & Align Category Bar

## Problem 1: Different images from Discover page
The Discover page (`/app/discover`) sorts items **featured first** (using `discover_featured_items` table), then by newest. The Dashboard section sorts only by `sort_order` from the database query. This means the order and visible items differ.

**Fix**: In `DashboardDiscoverSection`, fetch featured items and sort the same way — featured first, then by `created_at` desc. Import and use `useFeaturedItems` hook.

## Problem 2: Category bar not left-aligned with title
The `DiscoverCategoryBar` has a collapsible left arrow button that takes space on desktop, pushing the "All" pill away from the left edge. On the Dashboard, the category bar should start flush with the title.

**Fix**: Remove the left/right padding/margin from the category bar container when used on Dashboard. Add an optional `flush` prop to `DiscoverCategoryBar` that hides the arrow buttons entirely, or simply override with negative margin in the Dashboard. Simpler: just remove the left arrow's `w-6` allocation by hiding arrows entirely on the dashboard — pass a prop `hideArrows`.

## Changes

### 1. `src/components/app/DiscoverCategoryBar.tsx`
- Add optional `hideArrows?: boolean` prop
- When `hideArrows` is true, hide both chevron buttons entirely

### 2. `src/components/app/DashboardDiscoverSection.tsx`
- Import `useFeaturedItems` hook
- Sort items: featured first (by featured `created_at` desc), then by preset `created_at` desc — matching Discover page logic
- Pass `hideArrows` to `DiscoverCategoryBar` so the "All" pill aligns flush left with the title

### Files
- `src/components/app/DiscoverCategoryBar.tsx` — add `hideArrows` prop
- `src/components/app/DashboardDiscoverSection.tsx` — sort by featured first, pass `hideArrows`

