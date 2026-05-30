## What happened

I changed the wrong/older product selection component first. Your current route `/app/generate/product-images` is actually rendering `src/pages/ProductImages.tsx`, not `ProductImagesStep1Products.tsx`.

That is why you still see the old upload tile text `More options` in the preview, and why clicking `Upload Image` still quick-saves the product immediately instead of showing the category confirmation popup.

## Why this won’t mess up the app

The fix will be limited to the upload entry points on `/app/generate/product-images` only. I will not touch generation, shots, billing, credits, scene selection, existing saved products, backend schema, or global navigation.

## Plan

1. Update the real upload handler in `src/pages/ProductImages.tsx`
   - Replace the current quick-upload path for the Step 1 upload tile with the existing `BulkUploadReviewModal` flow
   - This means selecting one image or multiple images opens the review popup first
   - The user can confirm or change category before saving

2. Cover the matching upload entry points on that page
   - Existing-products upload tile
   - Empty-state “Upload product photo” button
   - Drag-and-drop upload on the product grid
   - Paste image upload while on Step 1

3. Keep the old “More options” path unchanged
   - It will still open the Add Product modal for URL / manual / import-style workflows
   - Only direct image upload should route to category confirmation

4. Clean up the earlier misplaced change
   - Remove the unused single-file/upload popup wiring from `ProductImagesStep1Products.tsx` if it is not used by this route
   - This reduces risk and avoids having two conflicting upload implementations

5. Verify the visible UI signal
   - The upload tile on `/app/generate/product-images` should no longer immediately save
   - It should open the review popup titled like `Review 1 uploads` with a category dropdown before saving