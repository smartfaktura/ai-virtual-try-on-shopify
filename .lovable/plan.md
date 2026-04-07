

# Style & Outfit Section Polish

## Changes

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

### 1. Move Style & Outfit section right after model selection
Currently the section (lines 1660-1707) sits after the Background style card. Move it to render immediately after the "Choose model" card (after line 1617), before "Background style".

### 2. Pre-select "Studio Standard" preset
In `OutfitPresetsOnly`, add an `useEffect` that auto-loads the first built-in preset ("Studio Standard") if no `outfitConfig` is set yet. This ensures cold users see a sensible default selected on arrival.

### 3. Show "Auto" summary on collapsed Outfit and Appearance triggers
- For the **Outfit** collapsible trigger (line 1677-1678): if `getOutfitSummary()` returns empty or matches the default preset, show `Auto` in muted text instead of blank.
- For **Appearance** (line 1690-1691): already shows `Auto` via `getAppearanceSummary` — no change needed.

### 4. Modernize preset card styling
Replace the current `w-[130px] rounded-xl border` cards with cleaner, flatter chips:
- Remove `rounded-xl` → use `rounded-lg`
- Remove gradient backgrounds (`PRESET_GRADIENT`) — use flat `bg-muted/30` for inactive, `bg-primary/8 border-primary/30` for active
- Active state: `ring-1 ring-primary/40 border-primary/30 bg-primary/8` + `text-primary` name
- Inactive: `border-border/40 bg-muted/30` + subtle `hover:bg-muted/50 hover:border-border/60` (no dramatic color shift)
- Reduce padding to `px-3 py-2.5`
- Keep `w-[130px]` width

This removes the "weird hover" effect and makes cards feel modern/flat.

### Files modified
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`

