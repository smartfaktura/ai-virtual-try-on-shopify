

## Extract and Use Product Dimensions for Realistic AI Generations

### Why This Matters

When the AI generates a model wearing/carrying a product, it guesses the size. A backpack that's 28x35cm might render as tiny or oversized. If we feed the AI real dimensions (e.g., "backpack: 28cm wide x 35cm tall x 13cm deep"), it can scale the product correctly on the model.

### How Dimensions Get Extracted

**During Store URL import**: The AI already analyzes the HTML to extract title, images, and description. We extend the extraction prompt to also look for dimensions in:
- Product specification tables (like the example: Gylis 13cm, Plotis 28cm, Aukstis 35cm)
- JSON-LD structured data (many stores include `width`, `height`, `depth`)
- Description text (e.g., "Dimensions: 28 x 35 x 13 cm")

The AI returns a new `dimensions` field like `"28 x 35 x 13 cm"` or `null` if not found.

**During manual upload**: Users can optionally type dimensions in the product edit form.

### What Changes

**1. Add `dimensions` column to `user_products` table**

A nullable text column to store free-form dimensions (e.g., "28 x 35 x 13 cm", "One size", "L: 42cm, W: 30cm").

**2. Update import-product edge function** to extract dimensions

Add `dimensions` to the AI extraction prompt so it looks for size/dimension specs in the HTML. Return it alongside title, images, etc.

**3. Store dimensions when saving product** (frontend)

The `StoreImportTab` and `ManualProductTab` components pass dimensions through to the database insert. The Edit Product modal shows a "Dimensions" field.

**4. Pass dimensions into generation prompts**

When a product is selected for generation, include its dimensions in the prompt context: "Product dimensions: 28 x 35 x 13 cm -- render at realistic scale relative to the model."

**5. Show dimensions on product cards** (optional nice-to-have)

Display dimensions as a subtle chip on product cards in the library so users can verify the data.

### Technical Details

**Database migration:**
```sql
ALTER TABLE public.user_products 
ADD COLUMN dimensions text;
```

**Files changed:**

- `supabase/functions/import-product/index.ts` -- extend AI extraction prompt to include `dimensions` field, return it in response
- `src/components/app/StoreImportTab.tsx` -- pass `dimensions` from import response when saving product
- `src/components/app/ManualProductTab.tsx` -- add optional dimensions input field
- `src/components/app/AddProductModal.tsx` -- pass dimensions through the save flow (if needed)
- `src/pages/Freestyle.tsx` -- include `selectedProduct.dimensions` in the prompt context sent to generate-freestyle
- `supabase/functions/generate-freestyle/index.ts` -- use dimensions in the product reference section of the prompt (e.g., "Product dimensions: 28x35x13cm, render at correct scale")
- `src/pages/Products.tsx` or product card component -- show dimensions chip if available

**No new dependencies needed.**
