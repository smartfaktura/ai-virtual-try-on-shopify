

## Fix: Send Both Product Image and Reference Image to AI

### Problem
When a user selects a product AND uploads a reference image, the frontend sends only the reference image as `sourceImage` (line 240: `sourceImage || selectedProduct.image_url`). The product's own image is silently dropped. The edge function then labels this single image as `[PRODUCT IMAGE]`, so the AI has no idea what the actual product looks like.

### Solution
Add a separate `productImage` field to the payload so both images reach the AI with correct labels.

### Changes

**1. `src/pages/Freestyle.tsx` — Send product image separately**

- Add a new `productImageUrl` to the payload by uploading `selectedProduct.image_url` when a product is selected
- Keep `sourceImage` exclusively for user-uploaded reference images (no fallback to product image)
- Add `productImage` to the queue payload alongside `sourceImage`
- When only a product is selected (no reference upload), send product image as `productImage` (not `sourceImage`)

**2. `supabase/functions/generate-freestyle/index.ts` — Handle new field**

- Add `productImage?: string` to `FreestyleRequest` interface
- Update `buildContentArray` to accept and label `productImage` as `[PRODUCT IMAGE]`
- When both `sourceImage` and `productImage` exist: label product as `[PRODUCT IMAGE]`, reference as `[REFERENCE IMAGE]`
- When only `sourceImage` exists (no product selected): keep current `[PRODUCT IMAGE]` label for backward compatibility
- When only `productImage` exists: label as `[PRODUCT IMAGE]`
- Update `polishUserPrompt` context to distinguish `hasProduct` vs `hasReference` for better prompt construction
- Add a prompt instruction when both are present: "Use [PRODUCT IMAGE] for the product identity. Use [REFERENCE IMAGE] as visual/style/scene inspiration — place the product in a similar setting or style."

### Result
Users can select a product (AI sees the actual product image) AND upload a reference image (AI uses it for style/scene inspiration). Both images arrive at the AI with distinct labels and clear instructions.

### Files changed — 2
- `src/pages/Freestyle.tsx`
- `supabase/functions/generate-freestyle/index.ts`

