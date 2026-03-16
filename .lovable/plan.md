

## Plan: Update Product Listing Set card

The user wants several changes to the Product Listing Set workflow card:

### Changes

**1. Copy uploaded images into the project**
- `user-uploads://freestyle-13.png` → `src/assets/workflows/product-listing-result.png` (new background — brown bottle on driftwood)
- `user-uploads://freestyle-11.png` → `src/assets/workflows/product-listing-product.png` (product image — bottle on white background)

**2. `src/components/app/workflowAnimationData.tsx`** — Product Listing Set section (lines 64-80):
- Replace `background: listingResult` with import of the new result image
- Replace `listingProduct` in the product element with import of the new white-bg product image
- Change badge from `'8 Scenes'` → `'30+ Scenes'` and icon from `MapPin` → `Sparkles`
- Remove the `'No People'` badge entirely
- Add new badge: `'1 Click'` with `Camera` icon, positioned at bottom

**3. `src/components/app/WorkflowCard.tsx`** — featureMap (lines 26-31):
- Remove the `'No people — pure product focus'` line from the Product Listing Set features

