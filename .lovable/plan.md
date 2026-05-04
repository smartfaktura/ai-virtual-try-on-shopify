## Problems

1. **"Minimal Premium" auto-preselected**: The preset bar always shows a checkmark on a style because `autoPickedPresetName` feeds into `activePresetName`. Users see it highlighted before they chose anything.
2. **"Save current look" unclear**: The pill doesn't communicate what it saves or why you'd use it.
3. **"Custom look" label on per-scene cards**: Unclear — user wants it renamed to something like "Scene settings".

## Changes

### 1. Remove auto-preselection highlight (OutfitPresetBar + ProductImagesStep3Refine)

- Stop passing `autoPickedPresetName` as fallback in `activePresetName`. Only highlight a preset when the user explicitly clicked "Apply" via the confirmation flow (i.e., only use `appliedPresetName`).
- The auto-pick logic that fills empty scenes on mount can stay — it just won't visually highlight the preset bar pill anymore. No checkmark until the user acts.

### 2. Clarify "Save current look" button

- Rename to **"Save as custom style"** with a short helper tooltip or subtitle so users understand they're saving their current outfit configuration for reuse.

### 3. Rename "Custom look" to "Scene settings"

- In the per-scene status badges, replace **"Custom look"** with **"Scene settings"** (both instances: `source === 'custom'` and `source === 'ai' && perSceneCfg`).

## Files

- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — remove `autoPickedPresetName` from `activePresetName` prop, rename "Custom look" badges to "Scene settings"
- `src/components/app/product-images/OutfitPresetBar.tsx` — rename "Save current look" to "Save as custom style"
