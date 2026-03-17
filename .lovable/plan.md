

## Show Ice Roller Sample for Selfie/UGC, Keep Crop Top for Virtual Try-On

The sample product section (lines 2211-2261 in `Generate.tsx`) currently shows for all `uses_tryon` workflows. The user wants different sample products per workflow.

### Changes in `src/pages/Generate.tsx`

1. **Add a second sample product constant** (~line 90):
   ```ts
   const SAMPLE_UGC_PRODUCT: Product = {
     id: 'sample_ugc_ice_roller',
     title: 'Ice Roller',
     vendor: 'Sample',
     productType: 'Skincare Tools',
     tags: ['ice-roller', 'skincare', 'beauty'],
     description: 'Cooling ice roller for face and body. Soothes skin and reduces puffiness.',
     images: [{ id: 'img_sample_ugc', url: '/images/samples/sample-ice-roller.png' }],
     status: 'active',
     createdAt: '2024-01-01T00:00:00Z',
     updatedAt: '2024-01-01T00:00:00Z',
   };
   ```

2. **Copy the uploaded ice roller image** to `public/images/samples/sample-ice-roller.png`.

3. **Make sample product dynamic** (~line 2211): Replace the hardcoded `SAMPLE_TRYON_PRODUCT` reference in the empty-state branch with a computed value:
   ```ts
   const sampleProduct = isSelfieUgc ? SAMPLE_UGC_PRODUCT : SAMPLE_TRYON_PRODUCT;
   ```
   Then use `sampleProduct` everywhere in that block instead of `SAMPLE_TRYON_PRODUCT`.

4. **Update the continue handler** (~line 2799): Add `SAMPLE_UGC_PRODUCT` to the sample selection check:
   ```ts
   const sampleSelected = [SAMPLE_TRYON_PRODUCT, SAMPLE_UGC_PRODUCT]
     .filter(sp => selectedProductIds.has(sp.id));
   ```

5. **Update the product_id sanitization** in enqueue payloads to also recognize the UGC sample as non-DB (already handled — it checks against `userProducts`).

