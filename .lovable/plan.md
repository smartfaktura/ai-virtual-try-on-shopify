

## Match Freestyle Grid Side Gaps to Floating Header on Mobile/Tablet

### Problem

The floating mobile header has `p-3` (12px) padding from the viewport edges, giving it a nice inset. But the freestyle image grid only has `px-1` (4px) side padding, making images appear wider than the header. The user wants the grid to have the same left/right inset as the header.

### Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

1. **Line 426** (generating-only view): Change `px-1` to `px-3 lg:px-1` -- adds 12px side padding on mobile/tablet, keeps 4px on desktop.

2. **Line 452** (masonry layout): Change `px-1` to `px-3 lg:px-1` -- same adjustment for the main gallery grid.

This ensures the grid edges align perfectly with the floating header edges on mobile and tablet, while desktop (which has a sidebar, not a floating header) stays unchanged.

### No other files affected

The container in `Freestyle.tsx` uses `-mx-4` to stretch edge-to-edge, which is correct. The padding adjustment belongs inside the gallery component where the columns are rendered.

