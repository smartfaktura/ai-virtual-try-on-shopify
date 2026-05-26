Replace the wand icon chip in `BrandScenesPromoCard.tsx` with a small horizontal stack of 3 overlapping thumbnails sourced from random scenes in the current Shots step.

**Changes:**

1. `ProductImagesStep2Scenes.tsx`
   - Compute `promoThumbnails`: pick 3 random `previewUrl` values from the visible `ACTIVE_CATEGORY_COLLECTIONS` scenes (memoized, fallback to empty array if none available).
   - Pass `thumbnails={promoThumbnails}` to `<BrandScenesPromoCard />`.

2. `BrandScenesPromoCard.tsx`
   - Accept optional `thumbnails?: string[]` prop.
   - Replace the `w-10 h-10` Wand2 icon chip with a row of 3 overlapping rounded-xl thumbnails (`w-9 h-11` each, `-ml-3` offset on the 2nd/3rd, `ring-2 ring-background` for separation, subtle border, slight rotation for editorial feel).
   - Use `getOptimizedUrl(url, { quality: 50 })` and `ShimmerImage`. Fall back to the original Wand2 chip when no thumbnails are provided.
   - Remove the now-unused Wand2 import only if thumbnails always provided; keep as fallback.