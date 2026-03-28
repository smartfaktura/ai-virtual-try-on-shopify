

# Fix Discover Mobile Image Re-loading (Shimmer on Scroll-Back)

## Problem
When scrolling down and back up on mobile Discover, images re-shimmer because:
1. **Masonry column redistribution on load-more**: `visibleItems` grows when IntersectionObserver fires, and `columns[i % columnCount]` redistributes ALL items. Items shift between column containers, React unmounts/remounts them, resetting `ShimmerImage`'s `loaded` state.
2. **ShimmerImage drops aspect-ratio after load** (line 47: `aspectRatio && !loaded`), so on remount the container collapses momentarily before the shimmer reappears.

## Changes (safe, no layout breakage)

### 1. ShimmerImage: Always keep aspect-ratio on wrapper
**File: `src/components/ui/shimmer-image.tsx` (line 47)**

Change `aspectRatio && !loaded` → `aspectRatio` so the wrapper always reserves space. The `<img>` inside already fills `w-full h-full`, so removing the `!loaded` condition has zero visual effect — it just prevents layout collapse on remount.

### 2. Stable masonry columns (append-only)
**Files: `src/pages/PublicDiscover.tsx`, `src/pages/Discover.tsx`, `src/pages/PublicFreestyle.tsx`**

Wrap the column-building logic in `useMemo` keyed on `[sorted/visibleItems, columnCount]` and — critically — build columns from the full `sorted` array up front, then slice per-column to `visibleCount`. This way, when `visibleCount` increases, existing items stay in the same column and React reuses DOM nodes instead of unmounting them.

```text
Before:  visibleItems = sorted.slice(0, N)  →  columns[i % cols]
After:   columns built from sorted  →  each column sliced to its share of N
```

Items keep the same column assignment regardless of how many are visible. No unmount, no state reset, no re-shimmer.

### 3. ShimmerImage: Eager cache check on mount
**File: `src/components/ui/shimmer-image.tsx`**

Use a lazy state initializer that creates a temporary `Image()` object with the same `src` to check `.complete` — catches browser-cached images even on fresh mount. This is a safety net for any remaining remount scenarios.

## Layout Safety
- The aspect-ratio change keeps the same CSS value, just removes the conditional. The `<img>` with `object-cover` fills identically whether or not `loaded` is true.
- Column stability only changes *when* items enter columns, not their visual layout.
- The `ShimmerImage` is used in 31 files — all pass `aspectRatio` as a hint for the placeholder. Keeping it permanently active is strictly better (prevents CLS).
- The `DashboardDiscoverSection` uses `aspectRatioOverride` on `DiscoverCard` which wraps `ShimmerImage` in its own fixed-ratio div — unaffected.

