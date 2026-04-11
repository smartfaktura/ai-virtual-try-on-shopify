

# Fix: Reference Preview Images — Full Image, No Crop

## Problem
Three places still use `object-cover` which crops tall items like jeans:
1. **Line 1761** — generic extra-reference preview: `object-cover`
2. **ProductThumbnail component** — always uses `object-cover` via ShimmerImage

Lines 1874 and 1921 already use `object-contain` ✓

## Changes

| File | Line(s) | Change |
|------|---------|--------|
| `ProductImagesStep3Refine.tsx` | 1761 | `object-cover` → `object-contain` on the extra-reference `<img>` |
| `ProductThumbnail.tsx` | 27 | Add `object-contain` support via optional `fit` prop; default stays `cover` |
| `ProductImagesStep3Refine.tsx` | 1917 | Pass `fit="contain"` to `ProductThumbnail` in per-product reference cards |

Three one-line changes total.

