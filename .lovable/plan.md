

# Product Images — Fix Product Selection, Category Naming & Sticky Bar Overlap

## 3 Changes

### 1. Fix double sticky bar overlap

**Problem**: `CatalogStepProducts` has its own built-in floating selection bar (lines 469-498) with a "Next" button. `ProductImages.tsx` also renders `ProductImagesStickyBar` on steps 1-5. Two bars stack/overlap at the bottom.

**Fix**: Hide `ProductImagesStickyBar` on step 1 (since `CatalogStepProducts` already handles navigation there). Only show it on steps 2-5.

**File**: `ProductImages.tsx` — change `step >= 1` to `step >= 2` in the sticky bar condition.

### 2. Replace product selection with virtual-try-on style

**Problem**: `CatalogStepProducts` uses a padded card style with `object-cover` and large cards (4 cols). The virtual-try-on-set uses a compact 6-column grid with smaller cards, search, select all/clear, and grid/list toggle — which the user prefers.

**Fix**: Instead of using `CatalogStepProducts`, build a lightweight product selection inline in `ProductImages.tsx` step 1 that matches the try-on pattern from `Generate.tsx` lines 2917-3101:
- Compact grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6`
- Search bar + Select All / Clear buttons + Grid/List toggle
- `ShimmerImage` with `object-cover` and `aspect-square`
- Compact info below: title (10px) + product_type (9px)
- Circular checkmark badge (top-left)
- Add New Product card (dashed border)
- Selection count badge
- Keep the `AddProductModal` integration

**File**: `ProductImages.tsx` — replace `CatalogStepProducts` usage in step 1 with inline try-on style product grid. Remove `CatalogStepProducts` import.

### 3. Rename "Garments" to "Clothing & Apparel"

**Problem**: "Garments" is an industry term that's not intuitive for most users.

**Fix**: 
- In `sceneData.ts`: Change `title: 'Garments'` to `title: 'Clothing & Apparel'`
- In `ProductImagesStep2Scenes.tsx` keyword map: Keep the `'garments'` key but the title change propagates from `sceneData.ts`

**File**: `sceneData.ts` — update title on line 179.

## Summary

| File | Change |
|------|--------|
| `ProductImages.tsx` | Replace `CatalogStepProducts` with try-on style inline product grid; show sticky bar only on steps 2-5 |
| `sceneData.ts` | Rename "Garments" → "Clothing & Apparel" |

