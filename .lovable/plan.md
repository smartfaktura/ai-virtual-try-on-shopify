
## Problem

When a user selects "Style manually" mode, scenes with built-in (curated) looks show a green "Built-in look" badge and a subtle "Edit" button. The backend already supports overriding these built-in looks — the per-scene config is correctly passed to the prompt builder with `outfitOverrideEnabled: true`. However, the UI doesn't make it clear that built-in scenes are overridable. The "Edit" button blends in and users may think the curated look is locked.

## Solution

Make the UI clearly communicate that built-in scenes can be overridden in manual mode:

### Changes in `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. **Replace the "Edit" button text with "Override"** for built-in scenes (where `source === 'scene'` and no `perSceneCfg`). Keep "Edit" for scenes that already have a custom config or have no built-in look.

2. **Add an "Override" quick-action button** for built-in scenes. Currently, lines 3044-3057 hide the AI quick-apply button when `source === 'scene'`. Add an equivalent styled button that says "Override" so the user has a clear primary action.

3. **Update the badge text** in manual mode: change `Built-in look` to `Curated · tap to override` so users know it's not locked.

4. **Update the dialog message** (line 3254-3256): the existing text says "Customize below to override" — this is good but make it slightly more prominent by adding an "Override curated look" button that pre-clears the hint and lets the user start fresh with the outfit panel.

These are all UI-only changes. The prompt builder logic already works correctly.
