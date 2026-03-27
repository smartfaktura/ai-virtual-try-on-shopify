

# Fix: Deleted Scenes Still Appearing in Discover

## Problem
When you delete a scene/preset from Discover, the item reappears because it exists in **two tables** (`custom_scenes` and `discover_presets`) and only one gets cleaned up.

- Deleting a **preset** leaves the underlying `custom_scenes` row → the scene reappears as a scene-type item
- Deleting a **custom scene** leaves the promoted `discover_presets` row → it reappears as a preset-type item

## Fix
**`src/pages/Discover.tsx`** — update the `onDelete` handler (~lines 581-603):

1. **When deleting a preset**: After deleting from `discover_presets`, also check for and delete any matching `custom_scenes` row (match by title = scene name).

2. **When deleting a custom scene**: After deleting from `custom_scenes`, also delete any matching `discover_presets` row (match by title = scene name).

3. After both deletions, invalidate **both** query keys (`discover-presets` and `custom-scenes`).

This is a single-file change to the existing `onDelete` callback, adding ~6 lines of cross-table cleanup logic.

