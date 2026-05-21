# Reorder hoodies pills: Everyday UGC first

On `/ai-product-photography/hoodies`, the "Built for every hoodies shot" section currently shows "Essential Shots" before "Everyday UGC". Swap them so "Everyday UGC" is the first pill.

## Change

In `src/data/aiProductPhotographyBuiltForGrids.ts`, swap the order of the two hoodies group entries:
- Move `Hoodies · Everyday UGC` (lines 2201-2213) above `Hoodies · Essential Shots` (lines 2188-2200).

No other content, copy, or imagery changes.
