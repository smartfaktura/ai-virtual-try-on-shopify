

## Fix Product Images upload so new products are always saved clearly

### Problem
The `/app/generate/product-images` Product step has inconsistent upload behavior:

- Empty-state upload/paste saves immediately as a product
- The grid **Upload Image** card opens the manual upload drawer, where selecting an image does not save until **Add Product** is clicked
- The card subtitle says “drop, paste, or import”, but drag/drop is not fully wired on that grid area
- This makes it look like an uploaded item worked, even when no product record was created

### Fix approach
Make the Product Images page behavior consistent and harder to miss.

### Changes

1. **Use immediate quick-save for the grid Upload Image card**
   - Clicking **Upload Image** in the product grid will open a file picker directly
   - After choosing an image, it will use the same `handleQuickUpload` path that:
     - uploads to storage
     - analyzes the product
     - inserts into `user_products`
     - refreshes the product grid
     - auto-selects the new product

2. **Keep advanced/manual upload available**
   - Keep `AddProductModal` for cases where the user wants:
     - multiple images
     - extra angles
     - manual title/type edits before saving
     - import URL / CSV / Shopify
   - Add a small secondary action such as **More upload options** or **Import options** instead of making the main Upload Image card open the manual drawer

3. **Add proper drag/drop support to the product grid**
   - Wire `onDragOver`, `onDragLeave`, and `onDrop` around the Step 1 product grid
   - Dropping an image will call `handleQuickUpload`
   - The existing drag overlay will actually work instead of only being visual state

4. **Improve feedback**
   - Show clear progress text:
     - Uploading
     - Analyzing
     - Saving product
   - After save, show a concise success toast like:
     - `Product saved and selected`
   - If saving fails, keep the current error toast

5. **Optional safety check**
   - After inserting the product, verify `newProduct.id` exists before selecting it
   - If the insert succeeds but no row is returned, invalidate products and show a warning instead of silently continuing

### Files to update
- `src/pages/ProductImages.tsx`
  - Update grid Upload Image card click behavior
  - Add hidden file input for quick upload when products already exist
  - Wire drag/drop handling around the Step 1 grid
  - Keep modal access as secondary upload/import option

No database migration is needed.

### Expected result
After this fix:

- Uploading from `/app/generate/product-images` always creates a saved product when using the main Upload Image action
- The product appears in the grid immediately
- The uploaded product is auto-selected
- Users will not accidentally upload/analyze a product without saving it
- Advanced product editing remains available when needed

