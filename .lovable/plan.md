## Plan

The current Product Details card still has mobile interaction problems because multiple controls are packed into clickable accordion/header areas. On iPhone-sized screens this makes the measurement unit/category/field controls unreliable and difficult to tap.

I’ll update `src/components/app/product-images/ProductSpecsCard.tsx` to make the measurement controls work clearly on mobile.

## Changes

1. **Make the cm/in selector a standalone mobile-safe control**
   - Move it into its own row on small screens instead of squeezing it beside the card title
   - Give `cm` and `in` larger tap targets
   - Stop the click/touch from bubbling to the collapse header
   - Keep the compact inline layout on desktop if there is enough room

2. **Fix product category selection inside the product accordion**
   - The category dropdown currently sits inside the product accordion button, which is another invalid/fragile interactive nesting pattern
   - Split the product row into a non-nested structure so tapping the category selector does not toggle the accordion or get swallowed on mobile
   - Add `type="button"` to accordion buttons where missing

3. **Improve measurement fields on mobile**
   - Use a one-column layout on very small screens so Width/Height inputs are not cramped
   - Keep the unit label (`cm`/`in`) aligned next to each input
   - Ensure inputs/selects have enough height for reliable tapping on iOS

4. **Preserve current data behavior**
   - Keep the same serialized product details format
   - Switching `cm`/`in` will continue to update displayed unit labels and placeholders
   - Existing saved details and category overrides remain compatible

## Expected result

On the 440px mobile viewport shown in your screenshot, you’ll be able to reliably tap:

- `cm`
- `in`
- category selector (`Wallet`)
- width/height fields
- save details

without the accordion/header intercepting the tap.