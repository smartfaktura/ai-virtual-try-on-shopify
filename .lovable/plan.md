# Always show the category confirmation popup, even for 1 file

## Issue
Single-file uploads on `/app/generate/product-images` open `AddProductModal` → `ManualProductTab`, which has only an inline picker — no popup. Only 2+ files trigger `BulkUploadReviewModal`. User expects the popup for every upload.

## Fix
In `src/components/app/product-images/ProductImagesStep1Products.tsx`, drop the `files.length === 1` branch and always route picked files through `BulkUploadReviewModal` (1 file or many). The modal already analyzes per file, lets the user confirm/edit the AI category, then saves to `user_products` and pre-selects them.

The "Add Product" empty-state button keeps opening `AddProductModal` so users without products can still choose URL / CSV / Shopify import methods.

## Files
- `src/components/app/product-images/ProductImagesStep1Products.tsx` — remove single-file branch, send all uploads to `BulkUploadReviewModal`.

## Out of scope
- `BulkUploadReviewModal` internals (already shows per-row category select).
- Other entry points and `ManualProductTab`.
- Backend / DB.
