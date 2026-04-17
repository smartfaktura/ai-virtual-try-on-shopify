

## Fix Library empty-state flash with skeleton loader

### Problem
On `/app/library`, when navigating in or refreshing, you briefly see a flash of stale/previous content (or layout) before the empty state appears. Two reasons:

1. **Loading state is a tiny centered spinner** (`Loader2` at line 533-535) — visually it reads as "nothing here", which feels identical to the empty state. So the transition `spinner → empty card` looks like `empty → empty` with a flash.
2. **`keepPreviousData`** in `useLibraryItems` (line 254) preserves the previous page's data across query-key changes, so for one frame after mount the hook can return `isLoading: false` with stale items before reconciling to the true empty result.

### Fix

**File:** `src/pages/Jobs.tsx`

**A. Replace the spinner with a proper skeleton grid** that matches the masonry layout (lines 532-535):
- Render N skeleton cards in the same column grid the real content uses
- Use varying heights to mimic the masonry feel
- Use the existing `<Skeleton />` component from `@/components/ui/skeleton`

**B. Tighten the loading condition** so we show skeleton whenever data isn't truly settled for the current query key:
- Use `isPending` (true only on initial fetch with no data) OR `isFetching && allItems.length === 0`
- Also hide the toolbar/tabs during initial load to avoid them flashing in then out

**C. Hide `EmptyStateCard` until loading is fully done** — the current `items.length === 0` branch fires the moment `keepPreviousData` clears, even if a refetch is mid-flight. Gate it on `!isFetching || allItems.length > 0`.

### Skeleton design (matches existing masonry grid)
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │ │      │
│      │ │      │ └──────┘ │      │
└──────┘ │      │ ┌──────┐ │      │
┌──────┐ └──────┘ │      │ └──────┘
│      │ ┌──────┐ │      │ ┌──────┐
└──────┘ │      │ └──────┘ │      │
```
- Same column count as `columnCount` setting
- 6-8 cards per column with rotating aspect ratios (3:4, 1:1, 4:5, 4:3)
- `rounded-2xl` to match `LibraryImageCard` corners
- Subtle pulse via existing `Skeleton` component

### Acceptance
- Hard refresh on `/app/library` (empty account): skeleton grid → empty state card. No flash of previous page or empty card before grid.
- Hard refresh with content: skeleton grid → real cards. No flash.
- Toolbar/tabs don't flash in then out during initial load.
- No regression on infinite scroll loading indicator (line 580-586 stays as-is — that's the in-flight overlay for subsequent pages).

### Out of scope
- Changing `useLibraryItems` cache strategy (`keepPreviousData` is correct for sort/filter changes — we just gate UI on it properly).
- Route-level transition animations.

