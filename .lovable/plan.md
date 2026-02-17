

## Pixel-Perfect Grid + Prompt Bar Alignment (Mobile/Tablet Only)

### Problem

Two issues on mobile and tablet:

1. **Grid side padding mismatch**: The freestyle image grid uses `px-[15px]` (15px) while the floating header bar uses `p-3` (12px). This creates a 3px mismatch on each side -- the grid is slightly narrower than the header bar.

2. **Prompt bar too wide**: The prompt bar container uses `px-3` (12px) on mobile and `px-6` (24px) on tablet, making it stretch close to the viewport edges with little visible breathing room.

### Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

1. **Line ~426** (small count layout): Change `px-[15px] lg:px-1` to `px-3 lg:px-1` -- matches the floating header's `p-3` (12px) exactly.

2. **Line ~452** (masonry layout): Same change -- `px-[15px] lg:px-1` to `px-3 lg:px-1`.

**File: `src/pages/Freestyle.tsx`**

3. **Line ~583** (prompt bar wrapper): Change `px-3 sm:px-6` to `px-4 sm:px-8` -- adds 4px more breathing room on mobile (16px vs 12px) and 8px more on tablet (32px vs 24px), making the prompt bar visibly narrower and more inset from the edges.

### Summary

- Grid now matches the floating header edges pixel-for-pixel (both use 12px from viewport)
- Prompt bar gains extra side padding so it floats with more visual breathing room above the grid
- Desktop layout is completely unaffected

