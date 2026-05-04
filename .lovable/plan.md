## Problem

The AI product analyzer can misclassify products (e.g. a dog leash detected as "Bag"). Currently users see the wrong category label in the Product Details card with **no way to change it**, which also means they get the wrong spec fields (Width/Height/Depth for bags instead of something relevant).

## Solution

Add a clickable category selector to the Product Details accordion header so users can correct the AI-detected category. Also add a "Pet Accessories" category with appropriate spec fields.

### Changes

**1. `src/components/app/product-images/types.ts`**
- Add `'pet-accessories'` to the `ProductCategory` union type.

**2. `src/lib/productSpecFields.ts`**
- Add `'pet-accessories'` category fields (Length, Width, Material, Hardware).
- Add `'pet-accessories'` to `CATEGORY_LABELS` (label: "Pet Accessory").
- Export a `ALL_CATEGORY_OPTIONS` array (sorted label/value pairs from `CATEGORY_LABELS`) for the override dropdown.

**3. `src/components/app/product-images/ProductSpecsCard.tsx`**
- Accept a new `onCategoryOverride` callback prop: `(productId: string, category: string) => void`.
- Next to the category label in each accordion header, render a small edit/pencil icon button.
- Clicking it opens a `Select` dropdown showing all available categories (from `ALL_CATEGORY_OPTIONS`).
- When the user picks a new category, call `onCategoryOverride` and the spec fields grid updates immediately to show the correct fields for the new category.
- Show a subtle note like "Category auto-detected - tap to correct" when the category seems wrong or on first view.

**4. `src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- Pass `onCategoryOverride` to `ProductSpecsCard`, wired to the existing `overrideCategory` function from `useProductAnalysis`.
- Ensure `overrideCategory` is destructured from the hook and threaded through.

### UX Details

- The category label in the accordion header becomes a small inline `Select` dropdown (compact, same row as the product title).
- When changed, the spec fields below instantly swap to match the new category.
- The override persists to `analysis_json` in the database (already handled by existing `overrideCategory`).
- No additional edge function or migration needed.
