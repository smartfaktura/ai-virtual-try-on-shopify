## Problem

When multiple product categories exist (e.g. Clothing & Apparel, Activewear, Jeans), each category has different scenes selected in Step 2 via `perCategoryScenes`. However Step 3 shows ALL model shots under every product because `productModelShots = modelShots` (line 2715) — it never filters by category.

## Solution

Pass `perCategoryScenes` and `categoryGroups` into Step 3, then filter scenes per product based on their category.

### Changes

**`src/pages/ProductImages.tsx`**
- Pass `perCategoryScenes` and `categoryGroups` as new props to `ProductImagesStep3Refine`

**`src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- Add `perCategoryScenes` and `categoryGroups` to `Step3RefineProps`
- In the per-product outfit group (around line 2715), replace `const productModelShots = modelShots` with logic that:
  1. Finds which category the product belongs to via `categoryGroups`
  2. Gets the scene IDs for that category from `perCategoryScenes`
  3. Filters `modelShots` to only include scenes in that category's selection
  4. Falls back to all `modelShots` when `perCategoryScenes` is empty (single-category case)
- Update the shot count in the header summary to reflect the correct per-product totals
