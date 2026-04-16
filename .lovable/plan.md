

# Fix "X images" Badge Not Fitting on Mobile

## Problem
On mobile, the product name and "2 images" badge are in a `flex` row with no overflow handling. Long product names push the badge off-screen.

## Fix

### `src/components/app/product-images/ProductImagesStep6Results.tsx` — Line 115-118

- Add `min-w-0` to the flex container so it respects overflow
- Add `truncate` to the `<h3>` product name so it ellipsis-truncates instead of pushing the badge out
- Add `flex-shrink-0 whitespace-nowrap` to the Badge so it never wraps or shrinks

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | Line 115-117: truncate product name, prevent badge from shrinking |

