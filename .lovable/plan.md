

## Replace 6 Sample Products with Single Ring Sample for Non-Try-On Workflows

### What changes

**File: `src/pages/Generate.tsx`**

1. **Add a new sample product constant** (next to existing `SAMPLE_TRYON_PRODUCT` and `SAMPLE_UGC_PRODUCT`):
   ```ts
   const SAMPLE_LISTING_PRODUCT: Product = {
     id: 'sample_listing_ring',
     title: 'Diamond Engagement Ring',
     vendor: 'Sample',
     productType: 'Jewelry',
     tags: ['ring', 'diamond', 'jewelry', 'engagement'],
     description: 'Pavé-set diamond engagement ring in white gold with signature ruby accent.',
     images: [{ id: 'img_sample_listing', url: '/images/samples/sample-ring.png' }],
     status: 'active',
     createdAt: '2024-01-01T00:00:00Z',
     updatedAt: '2024-01-01T00:00:00Z',
   };
   ```

2. **Copy the uploaded ring image** to `public/images/samples/sample-ring.png`.

3. **Replace the 6-product sample grid** (lines ~2282-2463) with a single-card layout matching the try-on sample pattern — one card with image, title, description, checkmark, plus "Add Your Products" / "Upload Instead" buttons below.

4. **Update the continue handler** (line ~2837): replace `sampleProducts` fallback with `[SAMPLE_LISTING_PRODUCT]` so the single sample is recognized as a valid selection.

5. **Add `SAMPLE_LISTING_PRODUCT`** to the sample ID check in the `product_id` sanitization for generation payloads (ensures `null` is sent for the sample to avoid FK errors).

6. **Remove the `SAMPLE_PRODUCT_IDS` / `sampleProducts`** constants (lines 76-77) since they're no longer used.

### Result
- Non-try-on workflows (Product Listing Set, etc.) show a single ring sample card when the user has no products
- Try-on workflows continue showing crop top / ice roller as before
- The ring image is optimized as a static asset under `/images/samples/`

