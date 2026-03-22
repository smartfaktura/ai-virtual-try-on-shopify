

# Admin Metadata Editor for Discover Presets

## What This Does
Adds an admin-only section in the Discover detail modal that lets you manually pick/change the scene and model shown on a preset. A "Save" button persists changes to the database. This fixes presets that were published without metadata.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

1. **Add admin metadata editor section** (visible only when `isAdmin && isPreset`), placed after the existing "Created with" section:
   - **Model selector**: Dropdown listing all mock models by name (from `mockModels`), plus a "None" option. Shows current `model_name` as default.
   - **Scene selector**: Dropdown listing all mock scenes by name (from `mockTryOnPoses`), plus a "None" option. Shows current `scene_name` as default.
   - **Save button**: Updates `discover_presets` row with the selected model's `name` + `previewUrl` and scene's `name` + `previewUrl`, then shows a success toast.

2. **State**: Two local state variables `editModel` and `editScene` (initialized from `item.data` when item changes). Only rendered for admin.

3. **On save**: Calls `supabase.from('discover_presets').update({ model_name, model_image_url, scene_name, scene_image_url }).eq('id', item.data.id)`. Also mutates the local `item.data` for immediate UI feedback (same pattern as the existing category selector).

4. **UI**: Compact admin section with dashed border, two `<Select>` dropdowns side by side, and a small "Save metadata" button. Styled consistently with the existing admin category selector.

### Imports
- Add `mockModels`, `mockTryOnPoses` from `@/data/mockData`
- Add `useMemo` from React for memoizing the combined model/scene lists

### File
| File | Change |
|------|--------|
| `src/components/app/DiscoverDetailModal.tsx` | Add admin metadata editor with model/scene selectors and save button |

One file, ~60 lines added. No schema changes needed — `discover_presets` already has all the required columns.

