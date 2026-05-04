## Changes

### 1. Rename "Model Styling" to "Outfit Styling"
Simple text change in `ProductImagesStep3Refine.tsx` at line 2614.

### 2. Add confirmation dialog for apply-to-all presets
Restore a lightweight confirmation flow in `OutfitPresetBar.tsx` for `mode="apply-all"`:
- Clicking a preset shows a compact inline confirmation: "Apply [name] to all N shots? [Apply all] [Set up one by one]"
- "Apply all" applies immediately to all shots (current behavior)
- "Set up one by one" dismisses the confirmation and expands the first scene for manual setup
- Pass a new `onSetupOneByOne` callback from the parent to handle expanding the first scene

### 3. Reflect active preset name in per-scene panels
When a preset is applied to all shots via the top-level bar, each per-scene `ZaraOutfitPanel`'s `OutfitPresetBar` should highlight that same preset. Currently `singlePresetName` is only set inside `ZaraOutfitPanel` for single mode and doesn't reflect the top-level applied preset.

Fix: In the per-scene `ZaraOutfitPanel`, pass `activePresetName` from `(details as any).appliedPresetName` so the per-scene "Quick styles" pills show the checkmark for the globally applied preset.

### 4. Aesthetic color section — show scene thumbnails
Below the header text in the aesthetic color `Card`, add a horizontal row of small scene thumbnails showing which scenes this color applies to. Each thumbnail shows the scene preview image, title, and a small colored dot overlay when a color is selected.

**Layout**: A compact horizontal scroll strip of scene mini-cards (48x60px thumbnails with scene title below), placed between the description text and the color swatches.

### Files changed
- `src/components/app/product-images/OutfitPresetBar.tsx` — Add confirmation with "Apply all" / "Set up one by one" options
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — Rename header, pass preset name to per-scene panels, add scene thumbnails to aesthetic color section, wire `onSetupOneByOne` callback
