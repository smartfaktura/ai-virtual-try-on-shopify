

## Add Sweater Sample for Mirror Selfie Set Workflow

Mirror Selfie Set has `uses_tryon: false`, so it currently falls into the non-try-on branch showing the ring sample. Need to add a workflow-specific sweater sample.

### Changes in `src/pages/Generate.tsx`

1. **Add `SAMPLE_MIRROR_PRODUCT` constant** (next to existing samples, ~line 113):
   ```ts
   const SAMPLE_MIRROR_PRODUCT: Product = {
     id: 'sample_mirror_sweater',
     title: 'Ribbed Knit Sweater',
     vendor: 'Sample',
     productType: 'Knitwear',
     tags: ['sweater', 'knit', 'beige', 'cozy'],
     description: 'Chunky ribbed knit sweater in warm beige. Relaxed cropped fit.',
     images: [{ id: 'img_sample_mirror', url: '/images/samples/sample-sweater.png' }],
     status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
   };
   ```

2. **Copy uploaded sweater image** to `public/images/samples/sample-sweater.png`.

3. **Update the empty-state branch** (~line 2233): Add a condition for `isMirrorSelfie` before the non-try-on fallback, showing the sweater sample card with the same single-card UI pattern.

4. **Update the continue handler** (~line 2696): Add `SAMPLE_MIRROR_PRODUCT` to the sample selection array so it's recognized as a valid selection.

5. **Update non-try-on continue handler** (where `SAMPLE_LISTING_PRODUCT` is checked): Also include `SAMPLE_MIRROR_PRODUCT` there since Mirror Selfie is non-try-on.

