

# Import Scenes from Admin Scenes → Product Image Scenes (with Sub-Category Selection)

## Overview
Add an "Import from Scenes" button on each category header in `/app/admin/product-image-scenes`. It opens a two-step modal: (1) select custom scenes to import, (2) configure product-image-scene fields including **sub-category placement**.

## Sub-Category Handling
The modal will include a sub-category selector per imported scene that mirrors the existing edit form pattern:
- **Dropdown** populated with existing sub-categories for the target category (e.g. for "Shoes": "Essential Shots", "Editorial", etc.) — pulled from `subCategoriesByCategory` map already computed in the admin page
- **"Create new" option** at the bottom of the dropdown — switches to a free-text input
- **"None" option** — leaves sub_category null (scene goes to "Uncategorized" group)
- **`sub_category_sort_order`** — auto-set based on the last sort order in the chosen sub-group + 1

## Field Mapping (auto-filled from custom_scene)

| Custom Scene | Product Image Scene | Auto/Manual |
|---|---|---|
| `name` | `title` | Auto |
| `description` | `description` | Auto |
| `prompt_hint` | `prompt_template` | Auto |
| `preview_image_url` / `image_url` | `preview_image_url` | Auto |
| — | `category_collection` | Auto (from clicked category) |
| — | `category_sort_order` | Auto (from clicked category) |
| `category` | `scene_type` | Auto-mapped, editable |
| — | `sub_category` | **Manual** (dropdown + create new) |
| — | `sub_category_sort_order` | Auto-computed |
| — | `trigger_blocks` | Manual (multi-select checkboxes) |
| — | `sort_order` | Auto (999), editable |
| — | `requires_extra_reference` | Manual toggle, default false |
| — | `scene_id` | Auto-slug from name, editable |
| — | `is_active` | Default true |

## Implementation

### 1. New component: `src/components/app/ImportFromScenesModal.tsx`
- Dialog with two steps:
  - **Step 1 — Pick**: Searchable grid of custom scenes (thumbnail + name + category badge), multi-select via checkboxes
  - **Step 2 — Configure**: Form for each selected scene with all fields. Sub-category uses the same Select pattern as the existing edit form: existing values dropdown → "Create new" free-text input → "None"
- Props: `open`, `onOpenChange`, `targetCategory` (string), `categorySortOrder` (number), `existingSubCategories` (string[]), `existingSceneIds` (string[])
- On submit: calls `upsertScene` for each scene, shows success toast

### 2. Update `src/pages/AdminProductImageScenes.tsx`
- Add "Import" button (with `Download` icon) next to the existing "+ New" button on each category header
- Pass `subCategoriesByCategory.get(categoryKey)` as `existingSubCategories`
- Pass existing `scene_id` values for duplicate warning

### 3. No database changes needed
Both tables exist with proper admin RLS policies.

## UX Flow
1. Admin opens Product Image Scenes → expands "Shoes"
2. Clicks "Import" button next to "+ New"
3. Modal Step 1: sees all custom scenes, searches/filters, checks 1-3 scenes
4. Clicks "Next"
5. Modal Step 2: for each scene, sees pre-filled fields. Selects sub-category from dropdown (e.g. "Essential Shots") or creates a new one
6. Adjusts scene_type, trigger_blocks if needed
7. Clicks "Import All" — scenes saved, modal closes, list refreshes

