
# Move Reference Uploads After Style & Outfit

Move the "Product-Specific Reference Uploads" section in `ProductImagesStep3Refine.tsx` from its current position (before "Complete setup") to after the "Style & Outfit" section and before the "Additional note" section.

## What changes

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. **Cut** the reference uploads block (lines 2418–2524) from its current position
2. **Paste** it between the end of Style & Outfit (line 2985) and the start of Additional Note (line 2987)

The hidden file inputs (packaging ref, per-product ref, trigger ref) stay in their current positions — they're invisible and work regardless of DOM order.

New flow in the Setup section:
```
Complete setup (model, background, aesthetic color)
  → Model Selection
  → Style & Outfit
  → Reference Uploads (sleeve buttons, inner lining, cuff detail, etc.)
  → Additional note
```
