## Problem

When clicking a preset in the top-level "Presets" bar (apply-to-all mode), it shows a confirmation prompt ("Apply X to all N shots?") instead of applying immediately. After clicking, when the user expands a scene below, the preset isn't reflected — confusing UX.

## Solution

Remove the two-step confirmation flow in `OutfitPresetBar` for `apply-all` mode. Clicking a preset pill should immediately call `onApplyToAll` and apply the outfit to all shots, just like single-mode applies instantly.

### Changes

**`src/components/app/product-images/OutfitPresetBar.tsx`**
- In `handleSelect`: when `mode === 'apply-all'`, call `onApplyToAll(merged, preset.name)` directly instead of setting `pendingPreset`
- Remove the `pendingPreset` state and the confirmation bar UI (the "Apply X to all N shots?" section)
- Show a toast confirmation instead (already happens via the parent handler)
- Keep the active preset highlight via `activePresetName` prop (already wired)

This is a single-file change, roughly 20 lines removed/simplified.
