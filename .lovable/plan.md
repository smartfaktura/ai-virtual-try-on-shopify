

# Fix: "Save metadata" fails for scene-type Discover items

## Problem

The Discover feed contains two item types:
- **Presets** — stored in the `discover_presets` table, updates work fine
- **Scenes** — sourced from mock data / `custom_scenes` table, have NO row in `discover_presets`

The "Save metadata" handler always runs `supabase.from('discover_presets').update(...)`, which silently fails (0 rows matched) for scene-type items since they don't exist in that table.

## Fix

**File: `src/components/app/DiscoverDetailModal.tsx`** (save handler, ~line 432)

Add a type check before the update. If the item is a scene type, update the `custom_scenes` table instead (for admin-created custom scenes), or show a message that built-in scenes can't have their metadata edited.

Specifically:
1. If `item.type === 'preset'` → update `discover_presets` as today (works)
2. If `item.type === 'scene'` and the poseId starts with `custom-` → update `custom_scenes` table with the relevant fields (name, category, description/prompt_hint)
3. If `item.type === 'scene'` and it's a built-in mock scene → show a toast "Built-in scenes cannot be edited"

The custom_scenes table supports: `name`, `description`, `category`, `prompt_hint`, `prompt_only`. Fields like `model_name`, `scene_name`, `workflow_slug` don't apply to scenes themselves, so those fields should be hidden or disabled in the admin panel when viewing a scene-type item.

### Changes summary

- **~line 432-478**: Wrap the existing save logic in an `if (item.type === 'preset')` branch. Add an `else` branch for scene items that updates `custom_scenes` using the real UUID (strip the `custom-` prefix from poseId).
- **~line 340-425** (admin panel UI): Optionally hide workflow/model/scene selectors when viewing a scene-type item since those fields don't exist on `custom_scenes`.

