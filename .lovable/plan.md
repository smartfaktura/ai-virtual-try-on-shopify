

# Easier Sub-Category Ordering — No Per-Scene Sort Values Needed

## Problem
Right now, sub-category group order is derived from the minimum `sort_order` of scenes inside each group. That means you'd need to manually adjust `sort_order` on individual scenes to reorder groups — tedious with dozens of scenes.

## Solution: Drag-and-drop sub-category reorder panel

Add a simple **sub-category reorder UI** inside each category's collapsible section in the admin page. This would be a small list of sub-category names with up/down arrows to reorder them. The order is stored as a lightweight JSON map on the `product_image_scenes` rows via a new column `sub_category_sort_order` (integer, default 0) — OR even simpler, we store it in the existing `category_sort_order` field which is already per-scene but underused.

**Simplest approach**: Add a `sub_category_sort_order` integer column to `product_image_scenes`. When you reorder sub-categories in the admin UI, it bulk-updates all scenes in that sub-category with the new group order value. Individual scene `sort_order` stays untouched — it only controls scene order *within* a sub-category.

### Changes

**1. Database migration** — Add `sub_category_sort_order` column:
```sql
ALTER TABLE product_image_scenes
ADD COLUMN sub_category_sort_order integer NOT NULL DEFAULT 0;
```

**2. `src/hooks/useProductImageScenes.ts`** — Update `buildCollections` to sort sub-groups by `sub_category_sort_order` (from the first scene in each group) instead of by min `sort_order`.

**3. `src/pages/AdminProductImageScenes.tsx`** — Add a small reorder strip per category:
- Shows sub-category names as a vertical list with up/down arrow buttons
- Clicking up/down swaps the `sub_category_sort_order` values and bulk-updates all scenes in those two groups
- No need to touch individual scene sort orders at all

### How it works for you
- Open a category (e.g., Fragrance)
- See sub-categories listed: "Editorial", "Essential Shots", "Uncategorized"
- Click the up arrow on "Editorial" to move it above "Essential Shots"
- Done — one click, all scenes in that group get the new order value automatically

### Files modified
- **Migration**: new column `sub_category_sort_order`
- `src/hooks/useProductImageScenes.ts`: sort by new column
- `src/pages/AdminProductImageScenes.tsx`: add reorder arrows UI
- `src/hooks/useProductImageScenes.ts`: include new column in `DbScene` interface

