

# Fix: Background strip showing wrong scene count

## Problem

The global Background strip says "All 3 scenes" but the "Editorial on Surface" scene doesn't have `'background'` in its `triggerBlocks` — it uses `sceneEnvironment` instead. The BG paintbrush icon correctly appears only on scenes with the `background` block, but the label is misleading.

## Fix

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. **Filter the count** — change the badge from `selectedScenes.length` to only count scenes whose `triggerBlocks` include `'background'`. Something like:
   ```ts
   const bgScenes = selectedScenes.filter(s => s.triggerBlocks?.includes('background'));
   ```

2. **Update the badge text** — show `All {bgScenes.length} scenes` when all selected scenes support BG, otherwise show `{bgScenes.length} of {selectedScenes.length} scenes`.

3. **Update `showBgStrip` condition** — only show the strip if `bgScenes.length >= 1` (not based on total selected scenes count).

4. **Variation engine alignment** — the `sceneVariations.ts` multiplier already correctly checks `triggerBlocks` per scene, so credit math is already accurate. This is purely a label fix.

| File | Change |
|---|---|
| `ProductImagesStep3Refine.tsx` | Filter `bgScenes` from `selectedScenes`, update badge text and strip visibility condition |

