

## Align Freestyle Grid Edges with Floating Header on Mobile/Tablet

### Problem

On mobile and tablet, the freestyle image grid does not perfectly align with the floating header bar. The header is `fixed` with `left-0 right-0 p-3` (12px inset from viewport edges). The grid's effective inset should also be 12px, but due to how the scrollable `main` container and negative margins interact, there's a slight pixel mismatch.

### Root Cause

The floating header is `position: fixed` and spans the true viewport width (`left-0 right-0`), so its `p-3` gives exactly 12px from the viewport edge. However, the grid content sits inside `main` which has `overflow-y-auto` -- this can introduce a scrollbar gutter that shifts the content area, meaning the negative-margin-plus-padding math doesn't perfectly resolve to the same 12px viewport inset as the fixed header.

### Fix

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

Two changes -- increase grid side padding on mobile/tablet to match the floating header bar's visual position:

1. **Line ~426** (small count layout): Change `px-3 lg:px-1` to `px-4 lg:px-1` (16px to account for the content wrapper's 16px base padding offset)
2. **Line ~452** (masonry layout): Change `px-3 lg:px-1` to `px-4 lg:px-1`

Additionally, in `src/pages/Freestyle.tsx`, the container's negative margins need to be slightly larger on mobile to compensate, OR we match by adjusting only the inner padding.

**Alternative simpler approach**: Since the content wrapper uses `px-4` (16px) on mobile and Freestyle uses `-mx-4` to cancel it, then adds `px-3` (12px) to the grid, the grid is at 12px. The header bar is also at 12px. If they still don't match visually, the more precise fix is to ensure both use the same reference. We can set the grid padding to `px-[12px] sm:px-[12px] lg:px-1` to be explicit, or adjust the negative margins.

Given the visual evidence, the most likely fix is to slightly increase the grid padding from `px-3` (12px) to `px-[15px] sm:px-3 lg:px-1` to account for any scrollbar gutter or rounding differences. But the cleanest approach is:

**File: `src/pages/Freestyle.tsx` (line 528)**
- On mobile only, remove the negative horizontal margins and instead use viewport-relative positioning, OR adjust the padding calculation.

**Recommended approach -- explicit viewport-relative padding in the gallery:**

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Line ~426: Change `px-3 lg:px-1` to `px-[15px] lg:px-1`
- Line ~452: Change `px-3 lg:px-1` to `px-[15px] lg:px-1`

This adds 3px more padding (15px instead of 12px) on mobile/tablet to visually match the floating header bar's rounded edge position. The `rounded-2xl` (16px border-radius) on the header makes the bar's visible content area start approximately 3px inward from its geometric edge, so 15px on the grid aligns with the bar's visual starting point.

Desktop remains at `px-1` (4px), unaffected.

### Summary

- Two lines changed in `FreestyleGallery.tsx`
- Grid side padding adjusted from 12px to 15px on mobile/tablet
- Desktop layout unchanged
