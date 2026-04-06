

# Per-Sub-Category Select All + Category-Specific Sub-Category Naming

## What changes

### 1. Per-sub-group "Select All" buttons in Step 2
Currently the single "Select All" button selects every scene in the entire category. Instead, each sub-group (e.g. "Essential Shots", "On-Model Looks") gets its own small "Select All" button, placed on the left — with the sub-category label moved to the right of the same row for a cleaner layout.

```text
[Select All]  ─────────────────────────  ESSENTIAL SHOTS
[scene] [scene] [scene] [scene]

[Select All]  ─────────────────────────  ON-MODEL LOOKS
[scene] [scene] [scene]
```

The top-level "Select All" button is removed.

### 2. Category-specific sub-category display names
Global scenes use a single `sub_category` value (e.g. "Essentials") but this label may not fit every category context. Add a `sub_category_overrides` JSON column to `product_image_scenes` so a global scene can say: `{ "fragrance": "Must-Have Shots", "garments": "Core Looks" }`.

When rendering Step 2, the frontend checks if an override exists for the current category context and uses it instead of the default `sub_category`.

### 3. Admin panel: manage overrides
In `SceneForm`, below the existing "Sub-Category" input, add an expandable section "Category-specific labels" showing one input per category where the admin can type alternate display names. Empty = use default.

## Database

**Migration** — add one column:
```sql
ALTER TABLE product_image_scenes
  ADD COLUMN IF NOT EXISTS sub_category_overrides jsonb DEFAULT '{}'::jsonb;
```

## Files

| File | Change |
|---|---|
| Migration | Add `sub_category_overrides` column |
| `src/hooks/useProductImageScenes.ts` | Add `sub_category_overrides` to `DbScene`, pass through to frontend type as `subCategoryOverrides` |
| `src/components/app/product-images/types.ts` | Add `subCategoryOverrides?: Record<string, string>` to `ProductImageScene` |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Remove top-level "Select All"; add per-sub-group select-all buttons on the left with label on the right; resolve sub-category display name using overrides for current category context |
| `src/pages/AdminProductImageScenes.tsx` | Add "Category-specific labels" expandable section in `SceneForm` with per-category override inputs |

