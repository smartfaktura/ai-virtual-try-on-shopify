

# Fix IntersectionObserver Memory Leak

## Problem
The `loadMoreSentinel` ref callback in `src/pages/ProductImages.tsx` creates a new `IntersectionObserver` on every render and returns a cleanup function — but React 18 ref callbacks ignore return values. Observers pile up, causing redundant `visibleCount` increments and memory leaks.

## Fix — `src/pages/ProductImages.tsx`

1. Add a `useRef<HTMLDivElement>(null)` for the sentinel element
2. Replace the ref-callback `loadMoreSentinel` with a `useEffect` that:
   - Reads the ref's current element
   - Creates one `IntersectionObserver`
   - Calls `setVisibleCount(v => v + 25)` when the sentinel is intersecting
   - Returns `() => observer.disconnect()` for proper cleanup
   - Dependencies: `[hasMore]` (so it reconnects only when load-more state changes)
3. Attach the `ref` to the sentinel `<div>` instead of the old callback

~15 lines changed, single file.

