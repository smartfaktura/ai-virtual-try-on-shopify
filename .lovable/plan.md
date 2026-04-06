

# Admin Sub-Categories + Sortable Sections + Cleaner Step 2 Header

## What we're solving

1. **No sub-grouping in admin**: Currently scenes within a category (e.g. "Clothing & Apparel") are a flat list. You want to group them into sub-categories like "Limited Edition Celebrity Style", "Jackets & Outerwear", "Small Accessories (hats, gloves, belts)", etc. — manageable from the admin panel.
2. **No section sort order**: The category sections themselves (Clothing, Fragrance, etc.) can't be reordered in admin. You want to control which sections appear first.
3. **Step 2 header feels heavy**: "Select scenes / Choose the visuals... / S M L / Recommended for your products / Clothing & Apparel 19 Recommended" — too much visual noise at first glance.

## Plan

### A. Database: Add `sub_category` column to `product_image_scenes`

Add a nullable `sub_category` text column. Scenes with the same `sub_category` value within a `category_collection` will be grouped together visually. Global scenes get sub_category too (e.g. `"essential"`, `"angles"`, `"detail"`).

Also add a `category_sort_order` integer column (default 0) — this controls the order of the category sections themselves. The first scene in each category determines the category's sort position.

**Migration:**
```sql
ALTER TABLE product_image_scenes 
  ADD COLUMN IF NOT EXISTS sub_category text DEFAULT null,
  ADD COLUMN IF NOT EXISTS category_sort_order integer DEFAULT 0;
```

### B. Admin Panel: Sub-category management + section sorting

**`src/pages/AdminProductImageScenes.tsx`:**

- Add a `Sub-Category` text input to `SceneForm` — free-text field where admin types e.g. "Limited Edition Celebrity Style", "Jackets & Outerwear", "Essentials"
- Show sub-category as a small tag next to each scene in the list view
- Add a "Category Sort Order" number input alongside the existing Category Collection dropdown — controls which category section appears first in Step 2
- Group scenes within each category by sub_category in the admin list for visual clarity
- Add up/down arrows at the category section level (not just individual scenes) to reorder entire categories

### C. Hook: Expose sub-categories and category ordering

**`src/hooks/useProductImageScenes.ts`:**

- Update `DbScene` interface: add `sub_category: string | null` and `category_sort_order: number`
- Update `dbToFrontend` to include `subCategory`
- Update `ProductImageScene` type to include `subCategory?: string`
- Update `buildCollections` to include sub-category grouping data
- Add `CategoryCollection.subGroups: { label: string; scenes: ProductImageScene[] }[]`
- Sort category collections by `category_sort_order` (from the first scene in each category)

### D. Step 2 UI: Sub-group rendering + cleaner header

**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`:**

**Cleaner header** — simplify the top section:
- Merge "Select scenes" heading and grid toggle into one compact row
- Move "Recommended for your products" label into the first category's badge area (remove the standalone sub-header)
- Selected count stays as a subtle badge, not a separate section

**Sub-group rendering** — within each expanded category section:
- Instead of always showing "Essential Shots" / "Category Shots", render by `subCategory` labels from DB
- Scenes without a sub_category fall into a default "General" group
- Each sub-group gets a small uppercase label divider (same style as current "Essential Shots")

**Result layout:**
```text
Select scenes                                          3 selected  [S][M][L]

▼ Clothing & Apparel                         Recommended  7 selected
  [Select All]
  
  ── Essentials ──
  [Clean Studio] [Marketplace] [Top-Down] ...
  
  ── On-Model Looks ──
  [Editorial Garment] [Movement Shot] [On-Model Look]
  
  ── Limited Edition Celebrity Style ──
  [Red Carpet Look] [VIP Unboxing] [Celeb Street Style]

▸ Fragrance                                              
▸ Beauty & Skincare
```

### E. Types update

**`src/components/app/product-images/types.ts`:**
- Add `subCategory?: string` to `ProductImageScene`

## Files

| File | Changes |
|---|---|
| Migration SQL | Add `sub_category` and `category_sort_order` columns |
| `src/hooks/useProductImageScenes.ts` | Update DbScene, dbToFrontend, buildCollections with sub-category grouping and category sort order |
| `src/components/app/product-images/types.ts` | Add `subCategory` to ProductImageScene |
| `src/pages/AdminProductImageScenes.tsx` | Add sub-category input to SceneForm, category sort order input, show sub-category tags in list |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Render scenes by sub-category groups, simplify header, remove standalone "Recommended" sub-header |

