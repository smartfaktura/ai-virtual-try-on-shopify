## Fix

Rewrite the 8 cards under `Necklaces · Editorial` in `src/data/aiProductPhotographyBuiltForGrids.ts` using only `Collarbone & Body Crops` (4) + `LIFESTYLE EDITORIAL` (4) — drop all `1781094…` Editorial Neck Studio IDs.

| # | Label | Subcategory | imageId |
|---|---|---|---|
| 1 | Collarbone Closeup | Collarbone & Body Crops | `1781096206479-c2y9uk` |
| 2 | Open Shirt Necklace | Collarbone & Body Crops | `1781096215251-97khdq` |
| 3 | Waterlight Necklace Campaign | Collarbone & Body Crops | `1781096555232-uq7jqb` |
| 4 | Side Profile Gold Necklace | Collarbone & Body Crops | `1781097562540-o5v2wt` |
| 5 | Mediterranean Sun Necklace | Lifestyle Editorial | `1781079796604-6n66k3` |
| 6 | Golden Hour Choker Necklace | Lifestyle Editorial | `1781079791470-exagx8` |
| 7 | Sea Glow Necklace Portrait | Lifestyle Editorial | `1781079799214-qbk8ai` |
| 8 | Golden Coast Necklace Walk | Lifestyle Editorial | `1781079789093-0dauye` |

Also update the necklace scene tile in `src/data/aiProductPhotographyCategoryPages.ts:486` (currently uses `1781094448800-p8owdm` Editorial Neck Studio) → replace with `Collarbone Closeup` (`1781096206479-c2y9uk`, `Collarbone & Body Crops`) so the Scene Examples row also pulls from the two requested subcategories.

Necklaces stays first pill. No other groups touched.

## Files

- `src/data/aiProductPhotographyBuiltForGrids.ts` — rewrite Necklaces cards
- `src/data/aiProductPhotographyCategoryPages.ts` — swap one scene tile (line 486)
