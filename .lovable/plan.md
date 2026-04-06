

# Remove Global Scenes + Per-Category Sub-Category Management

## Problem
The "Global (Universal)" scene concept is hard to manage — you can't easily customize the same scene for different categories. The admin list view doesn't show sub-category structure at a glance.

## Architecture Change

**Eliminate `is_global`**. Every scene belongs to exactly one `category_collection`. What were "global" scenes become individual copies per category, each independently editable (different prompts, sub-categories, sort orders).

### Migration strategy
- Add a backend migration that duplicates every `is_global = true` scene into each category it currently appears in (respecting `exclude_categories`)
- Each copy gets a new UUID, a new `scene_id` suffixed with the category (e.g. `clean-packshot-fragrance`), and `is_global = false` + the appropriate `category_collection`
- After duplication, delete the original global rows
- Drop the `is_global` column and `exclude_categories` column (no longer needed)

### Admin UI improvements

**Category headers show sub-categories inline:**
```text
▾ Fragrance (18)
   Essential Shots (6), Hero Scenes (4), Lifestyle (5), Detail (3)
   [scene rows...]

▾ Beauty & Skincare (15)  
   Must-Haves (5), On-Model (4), Textures (3), Lifestyle (3)
   [scene rows...]
```

Each category header displays comma-separated sub-category names with counts in parentheses. Clicking a sub-category scrolls/filters to that group.

**Remove "Global (Universal)" from the Category Collection dropdown** — every scene must belong to a real category.

**Remove "Show in Categories" checkbox section** and "Category-specific labels" section (no longer needed since each scene lives in one category).

## Files

| File | Change |
|---|---|
| Migration SQL | Duplicate globals into per-category copies, drop `is_global` + `exclude_categories` columns |
| `src/pages/AdminProductImageScenes.tsx` | Remove global section, remove exclude_categories UI, remove category-specific labels UI, add inline sub-category summary in category headers, remove `__global__` from CATEGORIES |
| `src/hooks/useProductImageScenes.ts` | Remove `is_global` logic from `DbScene` and `dbToFrontend`, simplify `buildCollections` (no global filtering), remove `globalScenes` export |
| `src/components/app/product-images/types.ts` | Remove `isGlobal` and `excludeCategories` from `ProductImageScene` |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Remove `getGlobalScenesForCategory`, remove `essentialScenes` concept — all scenes come from category sub-groups directly. Remove `GLOBAL_SCENES` import/usage |
| `src/components/app/product-images/sceneData.ts` | Remove `GLOBAL_SCENES` array and global references from `CATEGORY_COLLECTIONS` fallback. Each category gets its own full scene list as fallback |
| `src/lib/sceneVariations.ts` | No change needed (works on scene arrays regardless of global flag) |

## Step 2 UI (user-facing)
No visual change for end users — they still see categories with sub-grouped scenes and per-sub-group Select All buttons. The difference is purely backend: each scene is independently owned by its category.

## Admin sub-category summary
In each category collapsible header row, after the scene count badge, render:
```tsx
<span className="text-[10px] text-muted-foreground">
  Essential Shots (6), Hero Scenes (4), Lifestyle (3)
</span>
```
Computed by grouping that category's scenes by `sub_category` and showing `label (count)` joined by commas.

