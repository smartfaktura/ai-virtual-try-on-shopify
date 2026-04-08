

# Improve Gradient Presets in Color Picker & Background Swatches

## Changes

### 1. Update `GRADIENT_PRESETS` in `ColorPickerDialog.tsx`
Replace the current 6 generic presets with the user's 6 specific gradients:

| Name | From | To |
|---|---|---|
| Terracotta | #984D1B | #FBEFE9 |
| Ocean | #1C6CA0 | #C7E6F5 |
| Crimson | #B62020 | #FBE9E9 |
| Forest | #0F570F | #EAFBE9 |
| Sunset Duo | #D42525 | #246DCC |
| Navy Fade | #FFFFFF | #123668 |

### 2. Update gradient preset swatches in `ProductImagesStep3Refine.tsx`
Replace the 3 existing gradient entries in `BG_SWATCH_OPTIONS` (`gradient`, `gradient-warm`, `gradient-cool`) with updated presets that use the new gradient values. Keep 3 preset gradient cards but use the more visually distinct ones (e.g. Navy Fade, Terracotta, Ocean) so users see real variety. The "Custom Gradient" card still opens the picker for full control.

Also update the `Soft Gradient` / `Warm Fade` / `Cool Fade` labels to match the new names.

### 3. Update prompt builder gradient mappings in `productImagePromptBuilder.ts`
Update `BG_MAP` entries for the renamed gradient keys so the AI model receives correct color descriptions.

## Files modified
1. `src/components/app/product-images/ColorPickerDialog.tsx` — replace `GRADIENT_PRESETS` array
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — update 3 gradient entries in `BG_SWATCH_OPTIONS`
3. `src/lib/productImagePromptBuilder.ts` — update gradient key mappings in `BG_MAP`

