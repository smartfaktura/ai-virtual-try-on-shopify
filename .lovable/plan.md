
## Restructure Manual Outfit Mode UX

### Problem
When user selects "Style manually," the preset bar shows immediately as a large block, making it unclear where to start. The user wants per-scene editing to be the primary action, with bulk presets as a secondary option at the bottom.

### Changes

**1. Remove inline OutfitPresetBar from top of manual mode**
Replace the current preset bar + customize-all collapsible (lines ~2853-2914) with a guidance hint:
- Show a small instructional note: "Tap a shot below to customize its outfit around your product" with a subtle pointer icon
- This makes the per-scene list the clear primary action

**2. Improve per-scene row visual affordance**
Add a small "Edit" text or pencil icon on the right side of each scene row (replacing the bare chevron) to make it obvious the row is clickable.

**3. Add "Edit all shots in bulk" collapsible at bottom**
After the per-product groups, before the Appearance section, add a single button/trigger:
- Label: "Apply outfit to all shots at once"
- On click, opens a section containing:
  - **Outfit Presets** header with description: "Quick styles to apply across all on-model shots"
  - The existing `OutfitPresetBar` component
  - The existing `ZaraOutfitPanel` customize-all flow
- This keeps bulk editing accessible but de-emphasized

**4. Ensure preset save refreshes scene state**
After `handleApplyToAll` runs (which already updates `outfitConfigByScene` for each scene), verify the per-scene badges update immediately. The current implementation already does this via React state updates, but confirm `appliedPresetName` gets set so badges show "Scene settings" with the preset summary instantly.

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — All UI restructuring (items 1-4)
