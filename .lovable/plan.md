# Improve Admin Scene Manager

## Current State Analysis

**What works well:**

- Category reordering section
- Per-scene category reassignment via dropdown
- Move to top / up / down controls
- Save/dirty state tracking
- Delete (hide built-in, delete custom)

**What needs improvement:**

- Header layout: Save + Add Scene buttons are side-by-side without proper flex grouping (they overflow)
- No way to see scene metadata (prompt_only badge, custom vs built-in badge)
- No search/filter when you have 30+ scenes
- No inline scene editing — have to delete and re-add to change name/prompt
- Tedious one-by-one reordering for large lists
- No visual indicator which scenes are custom vs built-in
- No way to restore hidden built-in scenes

**User's feature requests:**

1. **Add new categories** — Currently `PoseCategory` is a hardcoded TypeScript union type. Adding a new category requires a code change. We can make this dynamic by storing categories in `poseCategoryLabels` and making the type more flexible (string-based with a known set).
2. **Same scene in two categories** — Currently each scene has exactly one category. To show the same scene in two categories, we need a "duplicate to category" action that creates a clone entry in `scene_sort_order` with a different `category_override`.

## Plan

### 1. Fix header layout in AdminScenes

Group Save + Add Scene buttons properly with `flex gap-2` wrapper.

### 2. Add scene metadata badges

Show small badges on each scene row:

- "Custom" badge (blue) for custom-uploaded scenes
- "Prompt Only" badge (amber) for scenes that don't send image to AI
- Show truncated prompt hint on hover (tooltip)

### 3. Add search/filter bar

Simple text input at the top to filter scenes by name across all categories. When active, show flat filtered list instead of category sections.

### 4. Add "Duplicate to Category" action

New button on each scene row (copy icon) that opens a small dropdown to pick a target category. This creates a clone of the scene in `orderedPoses` with a modified category — on save, it gets a separate `scene_sort_order` entry with `category_override`. For custom scenes, we can insert a new `custom_scenes` row with the different category.

### 5. Add "Restore Hidden" section

Collapsible section at the bottom showing hidden built-in scenes with an "Unhide" button for each.

### 6. Support custom category names

- Change `PoseCategory` type from union to `string` (keep the known values as a const array for autocomplete)
- Add an "Add Category" button in the Category Order section that lets admin type a new category slug + label
- Store new category labels in a simple mapping (can use `poseCategoryLabels` dynamically or a small DB table — simplest: store in `scene_sort_order` metadata or a new `scene_categories` table)
- For now, simplest approach: add an input field that lets admin create a new category by typing name, which gets slugified and added to the local state. On save, scenes assigned to this category get `category_override` set. The label mapping can be stored as a JSON column on a settings row or simply added to the `poseCategoryLabels` constant (requires code update but is simple).

**Pragmatic approach for categories**: Rather than building a full dynamic category system, add a few more useful categories to the hardcoded list (e.g. `workspace`, `restaurant`, `retail`, `seasonal`) and allow the category dropdown in the scene row to show all of them. This covers 90% of use cases without over-engineering.

### 7. Inline edit scene name

Double-click on scene name to edit inline. Auto-marks dirty.

## Files Changed

- `src/pages/AdminScenes.tsx` — major UI overhaul (search, badges, duplicate, restore hidden, inline edit, better layout)
- `src/types/index.ts` — add new categories to `PoseCategory` union
- `src/data/mockData.ts` — add new entries to `poseCategoryLabels`
- `src/hooks/useHiddenScenes.ts` — expose list of hidden scene IDs with names for restore section