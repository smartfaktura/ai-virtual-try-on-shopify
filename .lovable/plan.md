

## Show Curated Sample Products When User Has No Products

### Problem
When a user has no uploaded products, all workflow product-selection screens show the full set of ~28 mock products without any indication that these are samples. The user wants a curated set of 6 diverse sample products with a clear "SAMPLES" label and an "Upload Product" button.

### Changes — `src/pages/Generate.tsx`

**1. Create a filtered sample products constant** (near the top, after imports)

Define `SAMPLE_PRODUCT_IDS` containing exactly these 6 product IDs from mockData:
- `prod_fashion_001` — Airlift High-Waist Legging
- `prod_fashion_003` — Airlift Intrigue Bra
- `prod_cosmetics_003` — Velvet Matte Liquid Lipstick
- `prod_food_002` — Cold-Pressed Green Detox Juice
- `prod_home_003` — Belgian Linen Throw Pillow
- `prod_supp_003` — Magnesium Sleep Capsules

Derive `sampleProducts = mockProducts.filter(p => SAMPLE_PRODUCT_IDS.includes(p.id))`.

**2. Replace the empty-state fallback (line ~2208)**

Currently when `userProducts.length === 0` and not try-on:
```tsx
<ProductMultiSelect products={mockProducts} ... />
```

Replace with a block that:
- Shows a "SAMPLES" badge/label above the product grid: `"Sample products — upload yours to get started"`
- Passes `sampleProducts` instead of `mockProducts` to `ProductMultiSelect`
- Adds a prominent "Upload Product" button that opens `setShowAddProduct(true)`

**3. Fix the "Continue" mapping (line ~2577-2579)**

The fallback `mockProducts` used when mapping selected products for generation should also use `sampleProducts`:
```tsx
const mappedProducts = userProducts.length > 0
  ? userProducts.map(up => mapUserProductToProduct(up))
  : sampleProducts;
```

**4. Fix the ProductAssignmentModal (line ~3674)**

Same substitution: pass `sampleProducts` instead of full `mockProducts` when user has no products.

### Summary
- Single file change: `src/pages/Generate.tsx`
- Affects all non-try-on workflows (Product Listing Set, Flat Lay, Mirror Selfie, Image Upscaling, etc.)
- Shows 6 curated sample products spanning fashion, cosmetics, food, home, and supplements
- Clear "Samples" label so users know these aren't their own products
- "Upload Product" button to guide users to add their own

