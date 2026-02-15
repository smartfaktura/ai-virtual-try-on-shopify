

## Fix Flat Lay Workflow: Multi-Product Display, Image References, Prompt Engineering, and Credit Pricing

### Problems Identified

1. **Results page shows only 1 product** -- The "Publishing to" card in the results step always shows `selectedProduct` (single product), ignoring multi-select.
2. **Generated image only contains 1 product** -- Additional product images are listed in the prompt text but are NOT sent as actual image references to the AI. The AI only receives `[PRODUCT IMAGE]` (the first product). Without seeing the other products, it can't render them accurately.
3. **AI adds random text/details not in original** -- The prompt says "EXACT product from [PRODUCT IMAGE]" but lacks explicit instructions to avoid inventing text, logos, or details not present in the source image.
4. **Ring not realistically placed** -- The prompt doesn't instruct the AI to realistically lay each product flat on the surface. It needs explicit flat lay physics (gravity, natural resting position).
5. **No extra credit charge for multi-product** -- Multiple products increase AI compute complexity but cost the same as single-product flat lays.

### Changes

#### 1. Results Page: Show All Flat Lay Products
**File: `src/pages/Generate.tsx` (~lines 2132-2145)**

Replace the single-product "Publishing to" card with multi-product display when `isFlatLay` and multiple products selected (same pattern as the surfaces step fix).

#### 2. Send Additional Product Images as AI References
**File: `supabase/functions/generate-workflow/index.ts` (~lines 506-511)**

Currently only `body.product.imageUrl` is added to `referenceImages`. Add all `additional_products` images as reference images so the AI can actually SEE them:

```text
referenceImages = [
  { url: body.product.imageUrl, label: "product" },
  ...additionalProducts.map((p, idx) => ({ url: p.imageUrl, label: `product_${idx+2}` })),
];
```

Also update the prompt to use inline tags `[PRODUCT 1 IMAGE]`, `[PRODUCT 2 IMAGE]`, etc.

#### 3. Convert Additional Product Images to Base64
**File: `src/pages/Generate.tsx` (~lines 518-534)**

Currently `additionalProducts` just passes raw `image_url` from the database (which may be HTTPS URLs). These need to be converted via `convertImageToBase64` so the AI can access them, same as the main product image.

#### 4. Improve Flat Lay Prompt Engineering
**Database: Update `generation_config` for workflow `24effc2d-...`**

Replace the prompt template with a flat-lay-specific one that:
- References ALL product images with numbered tags: `[PRODUCT 1 IMAGE]`, `[PRODUCT 2 IMAGE]`, etc.
- Explicitly instructs: "Do NOT add any text, logos, patterns, or details that are not visible in the original product images"
- Adds realistic flat lay physics: "Each product must rest naturally on the surface as if physically placed there -- rings lie flat showing the band, clothing is folded or draped, bags rest on their base"
- Strengthens surface instruction: the product must look physically ON the surface, not floating

Update `negative_prompt_additions` to include: "invented text, added logos, hallucinated details, floating products, unrealistic placement"

#### 5. Credit Pricing: Extra Per Additional Product
**File: `src/pages/Generate.tsx`**

Add extra credits per additional product (e.g., +2 credits per extra product). Update the credit cost display to show the breakdown. Update the `enqueue` call to pass the extra cost info.

**File: `supabase/functions/enqueue-generation/index.ts`**

Accept an `additionalProductCount` parameter and factor it into credit calculation.

### Technical Details

**Prompt template update (database):**
```text
Create a professional flat lay photograph shot from DIRECTLY OVERHEAD (90-degree bird's eye view).

PRODUCTS TO INCLUDE (you MUST include ALL of these):
- Product 1: [PRODUCT 1 IMAGE] -- reproduce this EXACTLY as shown
{additional products listed dynamically}

CRITICAL RULES:
1. Reproduce EVERY product EXACTLY as shown in its reference image -- same colors, textures, labels, text, shape.
2. Do NOT invent, add, or hallucinate any text, logos, patterns, tags, or details not visible in the source images.
3. Each product must rest NATURALLY on the surface as gravity would place it:
   - Rings: lying flat showing the band and setting
   - Clothing: neatly folded or artfully draped
   - Bags: resting on their base or side
   - Jewelry: laid flat, clasps visible
4. Arrange all products in an aesthetically balanced composition with intentional spacing.
5. Even, diffused overhead lighting. No harsh shadows.
```

**Reference images fix in edge function:**
```text
// Add additional product images as references
if (body.additional_products?.length) {
  for (const [idx, ap] of body.additional_products.entries()) {
    if (ap.imageUrl) {
      referenceImages.push({ url: ap.imageUrl, label: `product_${idx + 2}` });
    }
  }
}
```

**Base64 conversion in Generate.tsx:**
```text
// Convert all additional product images
const additionalProducts = isFlatLay && selectedFlatLayProductIds.size > 1
  ? await Promise.all(
      userProducts
        .filter(up => selectedFlatLayProductIds.has(up.id) && up.id !== selectedProduct?.id)
        .map(async up => ({
          title: up.title,
          productType: up.product_type,
          description: up.description,
          imageUrl: await convertImageToBase64(up.image_url),
        }))
    )
  : undefined;
```

**Credit pricing update:**
- Base cost: standard workflow pricing (4 credits standard, 10 high)
- Each additional product: +2 credits per extra product per image
- Display: "3 products x 2 surfaces = 6 images + 4 extra product credits"

### Sequence
1. Fix results page multi-product display
2. Fix base64 conversion for additional product images  
3. Add additional product images as AI reference images in edge function
4. Update flat lay prompt template in database (better engineering)
5. Update negative prompts
6. Add credit surcharge for multi-product flat lays
7. Deploy edge function

