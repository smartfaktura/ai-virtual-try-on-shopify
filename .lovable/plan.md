

# Fix Import Scenes: Auto-Deduplicate IDs & Bulk Sub-Category Selector

## Problem
1. When importing a scene that already exists in another category, the scene_id conflicts and blocks import — user must manually rename each one
2. No way to set a sub-category for all imported scenes at once — must configure each separately

## Solution

### 1. Auto-suffix duplicate scene_ids (in `goToStep2`)
When generating the `scene_id` from the scene name, check against `existingSceneIds` and also against other configs being created in the same batch. If a collision is found, append `-2`, `-3`, etc. until unique.

**File:** `src/components/app/ImportFromScenesModal.tsx`

In `goToStep2` (~line 97), replace the simple `slugify(scene.name)` with a dedup function:
```typescript
function deduplicateId(base: string, existing: string[], taken: Set<string>): string {
  let candidate = base;
  let i = 2;
  while (existing.includes(candidate) || taken.has(candidate)) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}
```
Track a `takenIds` set during the loop so batch-internal collisions are also handled.

### 2. Bulk sub-category selector (above the per-scene cards in Step 2)
Add a "Set sub-category for all" dropdown at the top of Step 2. When changed, it updates `sub_category` on all configs at once. Individual per-scene overrides still work after.

**Same file**, in the Step 2 render section (~line 272), add a control bar before the scene cards:
- A `Select` dropdown with existing sub-categories + "Create new" option
- A "Apply to all" button or auto-apply on change
- Label: "Sub-category for all scenes"

### 3. Remove the hard block on duplicates
The `handleImport` function currently refuses to import if any duplicate IDs exist (line 165). With auto-dedup this becomes less likely, but keep the warning as a soft indicator rather than removing it entirely — the user can still manually create a conflict if they edit the ID field.

## Files Changed
- `src/components/app/ImportFromScenesModal.tsx` — add `deduplicateId` helper, bulk sub-category UI, apply-all logic

