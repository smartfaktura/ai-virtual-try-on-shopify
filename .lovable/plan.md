I found the issue: the recent optimization added responsive `width=` transforms to the storage image URLs. In this project that can crop/zoom images server-side, which is exactly the rule already saved in memory: full-bleed/card/background images must use quality-only optimization.

Plan:

1. Remove crop-causing width transforms
   - Update the `/ai-product-photography/*` category image usage so full image cards use quality-only optimized URLs.
   - Remove `srcSet` width variants from the hero collage, scene grids, built-for grid, related category collage, and fallback hero image.

2. Keep the good loading UX
   - Keep the `SmartImage` skeleton shimmer and fade-in behavior.
   - Keep lazy loading for non-critical images and eager/high priority only for the first hero tile.

3. Fix the hero preload so it does not request a cropped variant
   - Change the preload to use the same quality-only URL as the displayed first hero image.
   - Remove `imagesrcset/imagesizes` from the preload because those point to width-transformed variants.

4. Make the helper safer for future work
   - Adjust `getOptimizedSrcSet` or stop using it on these pages so it cannot accidentally be applied to full-bleed/card images again.
   - Add a clear code comment warning that width-based transforms are only safe for true fixed thumbnails, not these editorial image tiles.

Technical details:

- Files to update:
  - `src/components/seo/photography/category/CategoryHero.tsx`
  - `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`
  - `src/components/seo/photography/category/CategorySceneExamples.tsx`
  - `src/components/seo/photography/category/CategoryRelatedCategories.tsx`
  - `src/pages/seo/AIProductPhotographyCategory.tsx`
  - likely `src/lib/imageOptimization.ts` comment/helper guard

Expected result:

- Images return to their original framing without the unwanted zoom/crop.
- Skeletons and fade-in remain.
- Pages still load better than before via lazy loading, decoding async, quality compression, and LCP preload, but without using unsafe width transforms.