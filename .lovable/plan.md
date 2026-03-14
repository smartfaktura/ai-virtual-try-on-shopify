

## Hide "Description" Section for Scenes in Discover Detail Modals

### Problem
When viewing a scene in the Discover feed, the modal shows a "Description" label and text (e.g., "Casual outdoor pose on park bench"). This is unnecessary for scenes.

### Changes

Both modals need the same fix — wrap the description block in a condition so it only renders for presets:

**`src/components/app/DiscoverDetailModal.tsx`** (~lines 222-230)
- Wrap the description `<div>` with `{isPreset && ( ... )}` so it only shows the "Prompt" section for presets, not the "Description" for scenes.

**`src/components/app/PublicDiscoverDetailModal.tsx`** (~lines 106-114)
- Same change: only render the description block when `isPreset` is true.

Two files, ~2 lines changed each.

