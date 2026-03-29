

# Fix: Replace Auto-Load with Manual "Load More" in Perspectives Library Picker

## Problem
The library image picker in `/app/perspectives` uses an `IntersectionObserver` that automatically loads more items when scrolling, making it hard to control. The "Load more" button already exists but is immediately triggered by the observer.

## Change

**Single file: `src/pages/Perspectives.tsx`**

Remove the `useEffect` block (lines 216-230) containing the `IntersectionObserver`. The existing "Load more" button (line 793) already handles manual loading — it just needs to stop being auto-triggered.

Also remove the `librarySentinelRef` from the div wrapper (line 792) since it's no longer needed, and remove the `useRef` declaration (line 92).

| # | Action | Detail |
|---|---|---|
| 1 | Remove IntersectionObserver effect | Delete the `useEffect` (lines 216-230) that auto-increments `libraryVisibleCount` |
| 2 | Clean up ref | Remove `librarySentinelRef` declaration and its usage on the wrapper div |

