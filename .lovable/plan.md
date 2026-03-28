

# Fix Picture Perspectives Library Picker — Load All Images at Once

## Problem
The Perspectives page has its own inline library fetcher that only loads **50 freestyle + 50 jobs** (hard limit), and then shows them **10 at a time** with a "Load more" button (incrementing by 10). Users must click "Load more" many times to see all their images, and can never see more than ~100 total.

## Solution
Two changes:

### 1. Increase fetch limits & show more per page
- Increase both query limits from `50` to `200` each (freestyle + jobs) — this covers the vast majority of users' recent work
- Change initial visible count from `10` to `30` and increment from `10` to `30` per click
- This drastically reduces clicking while keeping the page responsive

### 2. Add infinite scroll (auto-load on scroll)
- Replace the manual "Load more" button with an `IntersectionObserver` that auto-loads the next batch when the user scrolls near the bottom of the grid
- Keep the button as a fallback but auto-trigger it

## File Changes

### `src/pages/Perspectives.tsx`
1. **Line 163**: Change freestyle `.limit(50)` → `.limit(200)`
2. **Line 169**: Change jobs `.limit(50)` → `.limit(200)`
3. **Line 90**: Change initial `libraryVisibleCount` from `10` → `30`
4. **Line 775**: Change increment from `c + 10` → `c + 30`
5. Add a small `useEffect` with `IntersectionObserver` on a sentinel div placed after the grid — when it enters viewport, auto-increment `libraryVisibleCount`

This keeps the single-fetch architecture (no pagination complexity) while making the experience feel seamless.

