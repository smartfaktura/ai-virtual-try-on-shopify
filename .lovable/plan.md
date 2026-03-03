

## Allow Product + Reference Image Together in Freestyle

### Problem
Currently, selecting a product auto-sets the source image preview (from the product's image), and uploading a reference image clears the selected product. They are mutually exclusive because the same `sourceImage` / `sourceImagePreview` state is used for both.

### Solution
Decouple the product selection from the reference image upload so both can coexist. The product chip provides product context (name, type, dimensions) while the uploaded reference image provides additional visual guidance to the AI.

### Changes

**`src/pages/Freestyle.tsx`**

1. **`handleFileSelect`** (lines 161-170): Remove `setSelectedProduct(null)` and `setProductSourced(false)` — uploading an image should no longer clear the product.

2. **`handleFileDrop`** (lines 172-180): Same — remove the product-clearing lines.

3. **`handleProductSelect`** (lines 190-210): Stop overwriting `sourceImage`/`sourceImagePreview` when a product is selected. Only set `selectedProduct`. Remove `productSourced` tracking entirely since they're now independent.
   - If no separate reference image is uploaded, the product's own image will still be sent as `sourceImage` during generation (handled in `handleGenerate`).

4. **`removeSourceImage`** (lines 182-188): Only clear `sourceImage`/`sourceImagePreview`, don't touch `selectedProduct`.

5. **`handleGenerate`** (around lines 245-398): Adjust source image logic:
   - If user uploaded a reference image → use that as `sourceImage`
   - If no upload but product selected → use product's image as `sourceImage`  
   - If both → send both (reference image as `sourceImage`, product image available via product context)

6. **Remove `productSourced` state** — no longer needed since the two are independent.

7. **Prompt panel preview**: The uploaded reference image thumbnail appears in the prompt bar. The product chip shows separately. Both visible simultaneously.

### Result
Users can select a product (for context: name, type, auto-framing) AND upload a separate reference image (for visual guidance) at the same time. The AI receives both signals for richer generation.

### Files changed — 1 file
- `src/pages/Freestyle.tsx`

