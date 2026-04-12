

# Fix Single-Product Thumbnail Size in Review Summary Card

## Problem
When only 1 product is selected, the product thumbnail in the bottom summary card uses a 4–6 column grid, making it appear tiny (~60px). The top context strip looks fine because it uses a different layout.

## Fix
**File:** `src/components/app/product-images/ProductImagesStep4Review.tsx` (lines 341-355)

Make the grid columns responsive to product count:
- 1 product → single column, max-width ~80px thumbnail
- 2-3 products → 2-3 columns
- 4+ products → current 4/6 column grid

Replace the static `grid grid-cols-4 sm:grid-cols-6` with dynamic column classes:

```tsx
const productGridCols = selectedProducts.length === 1
  ? 'grid-cols-2'
  : selectedProducts.length <= 3
    ? `grid-cols-${selectedProducts.length}`
    : 'grid-cols-4 sm:grid-cols-6';
```

And for single product, show the thumbnail slightly larger with the title beside it (inline layout) instead of below, matching the style seen in the top strip.

### Files changed
1. `src/components/app/product-images/ProductImagesStep4Review.tsx` — adjust product summary card layout based on count

