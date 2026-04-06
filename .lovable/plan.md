

# Multi-Select Background Swatches

## What changes

The global Background swatch selector ("All N scenes") currently allows only one selection. We convert it to multi-select so users can pick e.g. "Pure White" + "Warm" + "Cool" and get 3x images per scene, with credits updating live.

The variation engine (`sceneVariations.ts`) already handles `backgroundTone` as a comma-separated multi-select field — no backend or generation logic changes needed. This is purely a UI update.

## Changes

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**Update `BackgroundSwatchSelector`:**

1. Change the toggle logic from single-select (`onChange(value === o.value ? '' : o.value)`) to multi-select: clicking a swatch adds/removes it from a comma-separated string. E.g. clicking "White" then "Warm" produces `"white,warm-neutral"`.

2. Special handling for `custom` and `gradient-custom`: these remain mutually exclusive with each other (since they need input fields) but can coexist with preset swatches. When custom is selected, show the hex input; when gradient-custom is selected, show the gradient inputs.

3. Add a small `×N` badge next to "Background" label when multiple are selected, matching the style already used by `MultiChipSelector` for other fields.

4. Visual: selected swatches get the existing `border-primary bg-primary/5` treatment. Multiple can be highlighted simultaneously.

**Update the `onChange` prop type:** The parent currently calls `onChange={v => update({ backgroundTone: v })}` — this stays the same since we're still storing a comma-separated string.

### No other files need changes

- `sceneVariations.ts` — already has `backgroundTone` in `MULTI_SELECT_FIELDS` with block `'background'`
- `ProductImages.tsx` — `expandMultiSelects` already handles comma-separated `backgroundTone`
- `ProductImagesStep4Review.tsx` — already uses `computeTotalImages` which accounts for multipliers
- Credit counting — already works via the variation multiplier system

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Convert `BackgroundSwatchSelector` from single to multi-select toggle logic; add `×N` count badge |

