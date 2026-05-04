## Issues and Fixes

### 1. Outerwear "None" showing color/fit options
**Problem:** In `OutfitSlotCard.tsx`, the color, material, and fit sections render when `value?.garment` is truthy. Since `garment: 'none'` is truthy, those sections display for the "None" selection.
**Fix:** Change all three visibility checks from `value?.garment` to `value?.garment && value.garment !== 'none'`.

### 2. Add "None" to Dress types
**Problem:** No way to deselect a dress/jumpsuit once chosen (only an X button exists).
**Fix:** Add `{ id: 'none', label: 'None' }` as the first entry in `DRESS_TYPES` in `outfitVocabulary.ts`. Same prompt-builder skip logic already handles `garment === 'none'`.

### 3. Add "Barefoot" to Shoes
**Problem:** No option to go shoeless.
**Fix:** Add `{ id: 'none', label: 'Barefoot' }` as the first entry in `SHOE_TYPES` in `outfitVocabulary.ts`. The prompt builder already skips `garment === 'none'`.

### 4. Presets not visible in apply-to-all section
**Problem:** The `ZaraOutfitPanel` already renders `OutfitPresetBar` inside it (line 1718), and the presets do load from `useOutfitPresets`. However, the presets may not be showing because the `OutfitPresetBar` filters by `presetIsRelevant()` which checks if preset slots overlap with `resolution.availableSlots`. If the resolution is computed from a product that locks most slots, presets get filtered out.

The more likely issue: the `OutfitPresetBar` component's `useOutfitPresets` hook fetches from the DB, and the built-in presets come from a `filterBuiltIns` function inside that hook. Need to verify the hook passes categories correctly so universal presets appear.

**Fix:** Ensure the `OutfitPresetBar` inside the apply-to-all `ZaraOutfitPanel` receives proper `productCategories` so universal presets surface. If the filtering is correct but presets are hidden due to `presetIsRelevant` being too strict, relax it for universal presets.

---

## Files to edit

| File | Change |
|---|---|
| `src/components/app/product-images/OutfitSlotCard.tsx` | Change `value?.garment` guards (lines 70, 122, 144, 166) to `value?.garment && value.garment !== 'none'` so None/Barefoot hides color/material/fit |
| `src/lib/outfitVocabulary.ts` | Add `{ id: 'none', label: 'None' }` to `DRESS_TYPES` and `{ id: 'none', label: 'Barefoot' }` to `SHOE_TYPES` |
| `src/hooks/useOutfitPresets.ts` | Inspect and fix filtering so universal presets always appear regardless of slot overlap |
