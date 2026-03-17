

## Fix: Showcase images loading at 2MB each

### Root cause
In `ProductCategoryShowcase.tsx`, the `CATEGORIES` array uses raw local paths (`/images/showcase/fashion-camel-coat.png`) instead of the Supabase Storage URLs. The helper `s()` using `getLandingAssetUrl` is defined on line 68 but **never actually used** in the data array. This means:

1. Images are served as uncompressed PNGs from `public/` (~2MB each)
2. No `getOptimizedUrl()` compression is applied (which would reduce to ~60% quality, ~200-400KB)

### Fix

**File: `src/components/landing/ProductCategoryShowcase.tsx`**

1. Switch all image paths in the `CATEGORIES` array from local `/images/showcase/...` paths to `s('...')` calls (which resolves to the Supabase Storage URL)
2. Inside `CategoryCard`, wrap each image `src` with `getOptimizedUrl(img, { width: 600, quality: 60 })` to serve compressed, resized versions (~200-400KB instead of ~2MB)
3. Add `loading="lazy"` and `decoding="async"` to non-first images

This matches the existing optimization pattern used across the rest of the landing page (ShimmerImage + getOptimizedUrl).

