

# Duplicate Scene Button in Admin Product Image Scenes

## What this does
Adds a "Duplicate" button to each scene row in the admin panel. Clicking it creates a copy of the scene with a new unique slug (appending `-copy` or `-copy-2` etc.) and inserts it right after the original scene (sort_order = original + 1, shifting others down).

## Changes

### 1. Add `onDuplicate` handler in the main component
**File: `src/pages/AdminProductImageScenes.tsx`**
- Add a `handleDuplicate` function that:
  - Takes a `DbScene`, copies all fields except `id` and `scene_id`
  - Generates a new `scene_id` by appending `-copy` (or `-copy-2`, `-copy-3` if that slug already exists)
  - Sets `sort_order` to `original.sort_order + 1`
  - Calls `upsertScene.mutateAsync()` to insert the duplicate
  - Shows a success toast

### 2. Add duplicate button to `SceneRow`
- Add `onDuplicate: (s: DbScene) => void` prop to `SceneRow`
- Add a `Copy` icon button between the edit (pencil) and visibility (eye) buttons
- Uses `lucide-react`'s `Copy` icon

### 3. Pass `onDuplicate` at both call sites
- Both `SceneRow` render locations (sub-grouped and flat) get the new `onDuplicate` prop

## Files to modify
- **`src/pages/AdminProductImageScenes.tsx`** — add handler, prop, and button (single file change)

