

# Three UI/UX Fixes for Refine Step

## 1. Selected model appears first in inline row

Currently in `ModelPickerSections`, when a model outside the top 6 is selected, it replaces the last slot (`first6.slice(0, INLINE_LIMIT - 1), selectedModel`). Fix: place the selected model at position 0 instead of appending it last.

**File:** `ProductImagesStep3Refine.tsx` (lines 52-61)
- Change `inlineModels` logic: if the selected model isn't in the top 6 and isn't a user model, prepend it as the first item and take the next 5 from the filtered list (excluding the selected one).

## 2. Outfit preset color indicators: lines instead of dots

Currently `PresetColorDots` renders 3 small circular dots vertically. Replace with a vertical strip of thin horizontal color bars along the left edge of the preset button, creating a sleek "color swatch stripe" effect.

**File:** `ProductImagesStep3Refine.tsx`
- Redesign `PresetColorDots` → `PresetColorStripe`: render 3 thin horizontal bars (w-1, h-3 each, rounded, stacked vertically with no gap) forming a single left-edge color accent.
- Update the preset button layout to position this stripe flush against the left border.

## 3. Fix triangle indicator design

The current triangle uses a rotated div with borders which looks rough. Replace with a clean CSS triangle using `border-width` technique (transparent sides, solid bottom matching card background), properly centered below the active card with a subtle border outline.

**File:** `ProductImagesStep3Refine.tsx` (lines 1684-1689)
- Replace the rotated-div approach with a proper CSS triangle: an outer triangle (border color) with an inner triangle (card bg color) layered on top, creating a clean outlined arrow pointing down from the card into the expanded panel.
- Adjust spacing so the triangle visually connects the card to the panel seamlessly (no gap).

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Fix `inlineModels` to prepend selected model. (2) Redesign `PresetColorDots` to color stripe bars. (3) Replace triangle indicator with clean CSS triangle. |

