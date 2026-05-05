## Problem

The model selector cards in the "Select Models" modal and inline grid have their selected/hover ring (blue border) visually clipped because:

1. The parent grid containers use `gap-2` (8px), which is too tight for the `ring-2 ring-offset-2` + `scale-[1.02]` to render without overlapping adjacent cards.
2. The grid containers have no outer padding, so edge cards get their rings cropped.

## Changes

### 1. `src/components/app/ModelSelectorCard.tsx`
- Remove `overflow-hidden` from the outer button (it clips the ring). Move it to the inner image `div` only (already has it).
- Reduce `ring-offset` to `ring-offset-1` for tighter but visible spacing.
- Remove `scale-[1.02]` / `scale-[1.01]` hover effects that cause overlap issues in tight grids.

### 2. `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- Increase grid `gap-2` to `gap-3` on all model grids (inline and modal) to give rings breathing room.
- Add `p-1` padding to the modal scrollable area so edge rings aren't clipped by `overflow-y-auto`.

These are minimal, surgical fixes to ensure the blue selection ring is fully visible without cropping.
