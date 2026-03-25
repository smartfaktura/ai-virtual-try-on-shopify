

# Add "Create Category" + Easy Scene Assignment

## What we're building
An "+ Add Category" button in the Category Order section that lets you type a new category name, auto-generates a slug, saves it to the database, and immediately makes it available for assigning scenes. Plus a cleaner way to move scenes between categories.

## How it works

### 1. Database: `scene_categories` table
Store custom categories so they persist across sessions.

```sql
CREATE TABLE scene_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scene_categories ENABLE ROW LEVEL SECURITY;
-- All authenticated can read, admins can manage
```

### 2. New hook: `src/hooks/useSceneCategories.ts`
- Fetches all custom categories from `scene_categories`
- Mutation to add a new category (name → auto-slug: "Pet & Animal" → `pet-animal`)
- Mutation to delete unused custom categories
- Merges with hardcoded `poseCategoryLabels` to produce a full category list

### 3. UI changes in `src/pages/AdminScenes.tsx`

**"+ Add Category" button** at the bottom of the Category Order section:
- Click → inline input appears with label field
- Slug auto-previews below (e.g., typing "Pet & Animal" shows `pet-animal`)
- Confirm → saves to DB, appears in category order list + all scene category dropdowns immediately
- Cancel with Escape or X button

**Scene category dropdowns** now include all custom categories merged with built-in ones.

**Optional: delete empty custom categories** — small trash icon next to custom categories that have 0 scenes assigned.

### 4. Files changed
- **New migration** — `scene_categories` table + RLS policies
- **`src/hooks/useSceneCategories.ts`** (new) — fetch/add/delete custom categories
- **`src/pages/AdminScenes.tsx`** — add category button UI, merge custom categories into dropdowns and category order list
- **`src/types/index.ts`** — no changes needed (PoseCategory already accepts `string & {}`)

## Technical details

The `PoseCategory` type already includes `(string & {})` so custom slug strings are valid without type changes. Custom categories from DB get merged into the `poseCategoryLabels`-equivalent map at runtime. The category order section and per-scene Select dropdowns both use this merged map.

