

## Investigation: Why Only 1 Product Appears in Flat Lay Results

### Findings

The code pipeline is correct — when 3 products are selected:

1. **Frontend** builds an `additional_products` array with titles, types, descriptions, and image URLs for products 2 and 3 (line 931-942 in Generate.tsx)
2. **Edge function** receives them and injects:
   - A text block: `"ADDITIONAL PRODUCTS IN COMPOSITION: Product 2: ..., Product 3: ... Arrange ALL products together"`
   - Reference images for each additional product alongside the primary product image

### Root Cause

The issue is in how the AI model interprets the reference images. The prompt says:

> "The product MUST look EXACTLY like [PRODUCT IMAGE]"

...but `[PRODUCT IMAGE]` is ambiguous when 3 product images are provided. The additional product images are passed as unlabeled `image_url` content parts — the AI sees them but doesn't have a clear mapping between "Product 2" in the text and the corresponding image.

### Proposed Fix — Edge Function Prompt Improvement

**File: `supabase/functions/generate-workflow/index.ts`**

1. **Label reference images in the prompt** — When additional products exist, update the prompt to explicitly reference them:
   - Change `[PRODUCT IMAGE]` to `[PRODUCT IMAGE 1]` 
   - Add `[PRODUCT IMAGE 2]`, `[PRODUCT IMAGE 3]` references in the additional products block
   - Example: `"Product 2: Moisturizer (Skincare) — see [PRODUCT IMAGE 2]. Product 3: Serum — see [PRODUCT IMAGE 3]"`

2. **Strengthen the composition instruction** — Replace the current generic "Arrange ALL products together" with a more explicit directive:
   - `"This flat lay MUST contain EXACTLY {N} products. Each product must be clearly visible, separately identifiable, and occupy meaningful space in the composition. Do NOT omit any product."`

3. **Add a count-verification line to CRITICAL REQUIREMENTS** — After the existing requirements, add:
   - `"The final image MUST show exactly {N} distinct products. Count them before finalizing. Missing any product is a failure."`

### Summary

Single file change in the edge function prompt construction. No frontend or database changes needed. The data is already flowing correctly — the AI just needs stronger instructions to reliably composite all products.

