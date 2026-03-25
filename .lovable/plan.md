

# Fix Zoomed-In Product Images — Use `object-contain`

## Problem
`object-cover` on the product thumbnails crops/zooms the image to fill the square, cutting off most of the product. Need `object-contain` to show the full image within the 1:1 space.

## Changes

### `src/components/app/freestyle/ProductSelectorChip.tsx`

Change `object-cover` → `object-contain` on all product thumbnail `ShimmerImage` components (3 places):

1. **Line 178** (product grid): `className="w-full aspect-square object-contain rounded-t-md bg-muted/30"`
2. **Sample products** (~line 120): same change
3. **Selected product trigger chip** (~line 75): keep `object-cover` here since it's a tiny 16px icon — cropping is fine at that size

Add `bg-muted/30` so letterboxed areas have a subtle background instead of white gaps.

### Files
- `src/components/app/freestyle/ProductSelectorChip.tsx`

