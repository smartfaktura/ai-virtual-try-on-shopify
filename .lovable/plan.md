

# Fix Product Grid: Consistent Card Heights + Simplified "New" Card

## Problem
1. The "Add Product" button uses `min-h-[200px]` while product cards use `aspect-square` + variable text — causing misaligned grid rows
2. Product titles wrap differently (1 vs 2 lines), and `product_type` may be absent — different card heights
3. User wants the "Add Product" card to be clearer about what it does

## Fix — `src/components/app/product-images/ProductImagesStep1Products.tsx`

### Grid gap fix
- **"New" card**: Remove `min-h-[200px]`. Add an `aspect-square` top section (matching product cards) + a fixed-height text block below. Label it "New" with subtitle "Upload or import"
- **Product card text area**: Fix height to `h-[52px]` with `line-clamp-1` on title. Always render the `product_type` line (use `&nbsp;` placeholder if empty) so all cards have identical height
- **Image padding**: Reduce from `p-3` to `p-2`

### Simplified "New" card content
Instead of just a "+" icon with "Add Product", show:
- Upload icon + "New" label
- Small subtitle: "Upload or import"
- This makes it clear users can upload an image or add a product from various sources

The `AddProductModal` already handles all import methods (Upload, URL, CSV, Mobile, Shopify) — no changes needed there.

