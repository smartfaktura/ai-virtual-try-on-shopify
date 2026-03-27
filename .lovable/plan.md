

# Use Product Categories (not Discover Categories) in Add Scene Modal

## Problem
The "Add as Scene" modal currently shows all 18 Discover categories including content-style tags (editorial, commercial, cinematic, etc.) that don't make sense when categorizing a scene by product type. It should show only the 10 product categories with proper labels.

## Change

### `src/components/app/AddSceneModal.tsx`
- Replace `DISCOVER_CATEGORIES` import with `PRODUCT_CATEGORIES` import from `categoryConstants.ts`
- Update the Discover Category chip section to iterate over `PRODUCT_CATEGORIES` instead
- Use `cat.label` for display text and `cat.id` for the value
- This gives: Fashion & Apparel, Beauty & Skincare, Fragrances, Jewelry, Accessories, Home & Decor, Food & Beverage, Electronics, Sports & Fitness, Health & Supplements

One file, ~5 lines changed.

