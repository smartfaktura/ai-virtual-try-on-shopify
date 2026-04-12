

# Import Product Image Scenes → Admin Scenes (Reverse Import)

## Overview
Add an "Import from Product Visuals" button next to the existing "Add Scene" button on `/app/admin/scenes`. It opens a modal that lists all product image scenes, lets the admin select one or more, then maps them to the `custom_scenes` format and saves.

## Field Mapping (product_image_scenes → custom_scenes)

| Product Image Scene | Custom Scene | Notes |
|---|---|---|
| `title` | `name` | Direct |
| `description` | `description` | Direct |
| `prompt_template` | `prompt_hint` | Direct |
| `preview_image_url` | `image_url` | Direct (required, skip if missing) |
| `preview_image_url` | `preview_image_url` | Same URL |
| `scene_type` | `category` | Auto-mapped, editable dropdown |
| — | `prompt_only` | Toggle, default false |
| — | `discover_categories` | Optional multi-select |
| — | `created_by` | Auto (current user) |
| — | `is_active` | Default true |

## Implementation

### 1. New component: `src/components/app/ImportProductScenesModal.tsx`
- Two-step dialog (same pattern as `ImportFromScenesModal`):
  - **Step 1 — Pick**: Searchable grid of product image scenes (from `useProductImageScenes`), grouped/badged by `category_collection`, multi-select
  - **Step 2 — Configure**: Per-scene form with editable `name`, `category` (dropdown of all scene categories from `useSceneCategories`), `prompt_hint`, `prompt_only` toggle
- On submit: calls `useAddCustomScene` mutation for each scene
- Shows success toast

### 2. Update `src/pages/AdminScenes.tsx`
- Add "Import" button (with `Import` icon) next to the existing "Add Scene" button in the top action bar (~line 383-388)
- Import the modal component and wire open/close state
- Pass scene categories for the category dropdown

### 3. No database changes needed
Both tables exist with proper admin RLS policies.

## UX Flow
1. Admin opens `/app/admin/scenes`
2. Clicks "Import" button next to "Add Scene"
3. Modal Step 1: sees all product image scenes, searches/filters, selects some
4. Clicks "Next"
5. Modal Step 2: reviews/adjusts name, category, prompt for each
6. Clicks "Import All" — scenes saved as custom scenes, modal closes, list refreshes

