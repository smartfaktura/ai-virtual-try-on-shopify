## QA Fix & Deploy Readiness

### Problem
During the design-renewal QA sweep one residual image-optimization violation remains in `ProductImagesStep3Props.tsx` line 116: the prop-picker tile still calls `getOptimizedUrl(p.image_url, { width: 160, quality: 60 })`. The container uses `object-contain`, so the crop is visually masked, but the fetched bitmap is still server-side cropped — breaking our project-wide quality-only rule for user-facing thumbnails.

### Fix
- **File:** `src/components/app/product-images/ProductImagesStep3Props.tsx`
- **Change:** Remove the `width: 160` parameter from `getOptimizedUrl()` so it becomes `getOptimizedUrl(p.image_url, { quality: 60 })`. Keep `object-contain` behavior on the image element.

### Verification
- Check the prop-picker grid renders correctly with compressed (not cropped) images.
- Confirm no console errors.
- Confirm build passes.

### Deployment readiness
Once verified, the app is cleared for publish — all other rounding, optimization, and visual QA items from the brand-scenes, brand-models, and product-images renewals are already clean.