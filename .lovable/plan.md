# Reorder eyewear "Built for every shot" pills

Make **Color Vintage** the first pill on `/ai-product-photography/eyewear` in the "Built for every eyewear shot" section.

## Change

In `src/data/aiProductPhotographyBuiltForGrids.ts`, inside the `"eyewear"` array, move the `"Eyewear · Color Vintage"` group to the first position. The remaining groups stay in their current relative order:

1. Color Vintage (moved to top)
2. Editorial Portraits
3. Aesthetic Color
4. Vintage Film
5. Brutalist UGC
6. Creative
7. Essential Shots

No other files change. Card contents and image IDs are untouched, so admin slot overrides remain valid.
