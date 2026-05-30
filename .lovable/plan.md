# Make the bulk upload popup appear on /app/generate/product-images

## Why nothing showed up
The "Upload Image" tile on the Products step (`ProductImagesStep1Products.tsx`, line 118) opens `AddProductModal` → `ManualProductTab`. Last turn I added the new category-confirm chip + `BulkUploadReviewModal` to `UploadSourceCard`, which is a **different** upload card used by other flows. That's why the popup never appears on this route.

## What changes

### 1. Intercept the Upload Image tile click
In `ProductImagesStep1Products.tsx`:
- Replace the current "Upload Image" tile's `onClick={() => setShowAdd(true)}` with a hidden `<input type="file" multiple accept="image/*">` trigger.
- On file selection:
  - **1 file** → open `AddProductModal` (`compact`, `initialTab="manual"`, `initialFiles=[file]`) — same as today, so the existing single-file category picker in `ManualProductTab` is used.
  - **2+ files** → open the new `BulkUploadReviewModal` directly. Do **not** open `AddProductModal`.
- Keep the existing "Add Product" empty-state button as-is (still opens `AddProductModal`) so users without products can still choose URL/CSV/Shopify methods.

### 2. Reuse the existing BulkUploadReviewModal
The component already exists from last turn (`src/components/app/BulkUploadReviewModal.tsx`). We will:
- Mount it from `ProductImagesStep1Products.tsx`.
- On confirm, the modal saves each row to `user_products` (with `analysis_json.category`) using the same insert path it already uses.
- Wire `onComplete(productIds: string[])` to:
  1. Call `onProductAdded()` so the parent (`Generate.tsx`) refetches products.
  2. Merge the new ids into `selectedIds` via `onSelectionChange` so they're pre-selected.

### 3. Confirmation chip on single-file path
`ManualProductTab` already has a category picker (`categoryPickerOpen`, `suggestedCategory`). No structural change there — it already covers the "AI detected category, click to confirm/change" intent for the 1-file flow. Out of scope for this turn unless you want me to restyle it to match the new chip.

## Files to touch
- `src/components/app/product-images/ProductImagesStep1Products.tsx` — hidden file input on the Upload tile, branch single vs bulk, mount `BulkUploadReviewModal`.
- (No changes to `BulkUploadReviewModal.tsx`, `AddProductModal.tsx`, `ManualProductTab.tsx`, or `Generate.tsx`.)

## Out of scope
- Other upload entry points (`UploadSourceCard`, Products page, etc.) — already wired last turn.
- Restyling the existing single-file category picker inside `ManualProductTab`.
- Backend / `analyze-product-image` edge function.
- DB migrations.
