## Issues Found

1. **No way to customize + apply to all**: The top "Apply a style to all shots" section only has preset pills — no way to open the full outfit editor and apply custom settings to all shots.
2. **Per-scene quick styles don't highlight after applying**: `activePresetName` isn't passed to the per-scene `OutfitPresetBar` (single mode).
3. **Reset button too small and poorly positioned**: Tiny 11px text link in the top-right corner.
4. **3 products selected but only 2 scenes show**: `modelShots` filters scenes to those with `personDetails`/`actionDetails` trigger blocks. If a product's scenes lack these blocks, they won't appear. This is actually correct behavior (non-model scenes don't need outfit styling), but the UI doesn't communicate this.

## Changes

### 1. Add "Customize & apply to all" button that opens outfit editor modal

In the top-level "Apply a style to all shots" area, add a pill-style "Customize" button next to the preset pills. Clicking it opens a `Dialog` containing a `ZaraOutfitPanel` with an "Apply to all shots" confirmation button. This lets users build a custom outfit and apply it globally.

Also rename the section label from "APPLY A STYLE TO ALL SHOTS" to just "Presets" and show the "Save as custom style" as a same-style pill instead of a separate ghost button below.

### 2. Pass `activePresetName` to per-scene OutfitPresetBar

Track which preset was applied per scene (store in state or derive from config match), pass it to the single-mode `OutfitPresetBar` so the selected style highlights.

### 3. Improve Reset button

Move "Reset all" to a visible secondary button (outline variant, proper size) placed inline with the presets area, not hidden in the header corner.

### 4. Add scene count context per product

Below the "Model Styling" header, add a brief note like "Styling applies to 2 on-model shots across 3 products" so users understand why not all scenes appear.

## Files

- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — Add customize modal, move reset button, add scene context note, pass activePresetName to per-scene bar
- `src/components/app/product-images/OutfitPresetBar.tsx` — Restructure: "Presets" label, save-as-custom as inline pill
