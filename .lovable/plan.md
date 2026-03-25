

# Add "Edit Category Name" for All Categories

## What changes
Allow admins to rename **both** custom and built-in categories from the Category Order section in `/app/admin/scenes`.

## Why it's safe
- Only the **display label** changes, never the slug
- The slug (`studio`, `lifestyle`, etc.) is what scenes reference — it stays untouched
- The `useSceneCategories` hook already merges custom labels over `poseCategoryLabels`, so a built-in override just works
- `PoseCategorySection.categoryInfo` uses slugs as keys — unaffected by label changes

## How it works

### For custom categories (already in DB)
- Pencil icon next to label → inline input → save updates `label` in `scene_categories` table

### For built-in categories (not yet in DB)
- Same pencil icon → inline input → on save, **insert** a new row into `scene_categories` with the built-in slug and the new label
- The merge logic in `useSceneCategories` already handles this: custom labels override `poseCategoryLabels`

### Files changed

**`src/hooks/useSceneCategories.ts`**
- Add `useUpdateSceneCategory` mutation — updates `label` by ID
- Add `useUpsertCategoryLabel` mutation — for built-in categories, upserts a row with the existing slug + new label

**`src/pages/AdminScenes.tsx`**
- Add `editingCategorySlug` + `editingCategoryLabel` state
- Show Pencil icon next to every category in the Category Order list
- Click → inline Input with Check/X buttons
- Enter saves, Escape cancels
- For custom categories: calls update mutation
- For built-in categories: calls upsert mutation (creates override row in `scene_categories`)

### No database changes needed
The existing `scene_categories` table and RLS policies already support this. Built-in slugs inserted as overrides will be filtered correctly by the merge logic.

