## Problem

The "Built for every jewelry shot" section on `/ai-product-photography/jewelry` lives in `src/data/aiProductPhotographyBuiltForGrids.ts` (`"jewelry"` block, lines 920–end-of-jewelry). The `Necklaces · Editorial` pill still references 8 stale `imageId`s (`1776243…`) that point at retired previews. Also, `Necklaces` is the 2nd pill — user wants it first.

## Fix

In `src/data/aiProductPhotographyBuiltForGrids.ts`, inside the `"jewelry"` array:

1. **Reorder pills** so the order is: **Necklaces · Editorial → Rings · Editorial → Earrings · Editorial → Bracelets · Editorial**.
2. **Replace all 8 cards** under `Necklaces · Editorial` with current scenes from the two subcategories the user previously called out (Editorial Neck Studio + Lifestyle Editorial), using real `preview_image_url` IDs verified in `product_image_scenes`:

| # | Label | Source subcategory | imageId |
|---|---|---|---|
| 1 | Editorial Neck Portrait | Editorial Neck Studio | `1781094448800-p8owdm` |
| 2 | Seated Necklace Editorial | Editorial Neck Studio | `1781094452666-qbkiuy` |
| 3 | Shadowed Face Necklace | Editorial Neck Studio | `1781094456275-fuzt62` |
| 4 | Sunlit Collarbone Necklace | Editorial Neck Studio | `1781094463108-3v36ur` |
| 5 | Mediterranean Sun Necklace | Lifestyle Editorial | `1781079796604-6n66k3` |
| 6 | Golden Hour Choker Necklace | Lifestyle Editorial | `1781079791470-exagx8` |
| 7 | Sea Glow Necklace Portrait | Lifestyle Editorial | `1781079799214-qbk8ai` |
| 8 | Golden Coast Necklace Walk | Lifestyle Editorial | `1781079789093-0dauye` |

No other categories or sections are touched. Pill labels for Rings/Earrings/Bracelets stay unchanged.

## Files touched

- `src/data/aiProductPhotographyBuiltForGrids.ts` — reorder `jewelry` groups; rewrite `Necklaces · Editorial` cards.
