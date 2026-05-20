## Goal

Undo the earlier text rename across the codebase. Restore original chip/section names everywhere.

## Renames to revert (case-sensitive, whole-word)

- `EDITORIAL` → original term (two sources, see below)
- `Studio Shots` → `Campaign Statements`

The earlier edit mapped two different originals to the same new word `EDITORIAL`:
- `Hardware` → `EDITORIAL`
- `Essential Shots` → `EDITORIAL`

To revert correctly, restore each occurrence to its original term based on context (Bags/Watches/Tech/Jewelry typically used `Hardware`; Apparel/Fragrance/Beauty/Food/Sneakers/Lingerie/Swimwear/etc. used `Essential Shots`).

## Files to update

- `src/data/aiProductPhotographyBuiltForGrids.ts` — primary source; ~25+ `EDITORIAL` occurrences and the `Studio Shots` ones in Bags subCategories and inner labels (e.g. `EDITORIAL & Craft Closeup`, `EDITORIAL Close-Up`, `EDITORIAL Material Closeup`, `Dial & EDITORIAL Closeup`, `Material and EDITORIAL Detail`).
- `src/data/promptTokenReference.ts` — doc strings referencing `EDITORIAL`.
- Any other files surfaced by a repo-wide `rg` for `EDITORIAL`, `Studio Shots`, and the renamed labels (admin scene files mentioned in the prior turn: `AdminProductImageScenes.tsx` etc.).

## Approach

1. Repo-wide `rg "EDITORIAL"` and `rg "Studio Shots"` to enumerate every hit introduced by the prior rename.
2. For each hit, decide original term from context:
   - Bags / Watches / Tech / Jewelry hardware-style chips → `Hardware`
   - Generic product staple-shot chips (Apparel, Fragrance, Beauty, Food, Sneakers, Shoes, Lingerie, Swimwear, Eyewear, Hoodies, Supplements) → `Essential Shots`
   - Bags `subCategory: "Bags · Studio Shots"` → `Bags · Campaign Statements`
3. Apply targeted line edits; do not touch unrelated copy.
4. Spot-check `/ai-product-photography/bags` chips render as: `Campaign Statements · Editorial Studio · On-Body Editorial · Hardware · Everyday UGC`.

## Out of scope

- No visual/design changes.
- No data shape changes; labels only.
