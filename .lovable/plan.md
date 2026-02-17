

## Fix Zoomed-In Product and Scene Chip Images

### Problem
Product and scene chip thumbnails in workflow previews appear zoomed in and cropped because `getOptimizedUrl({ width: 200 })` resizes them server-side to 200px wide. The browser then applies `object-cover` on a 56x64px container, causing the crop to look distorted. This is the same issue that was already fixed for model circle images.

### Solution
Apply the same quality-only optimization to ALL element types (product, scene, model) -- no server-side width resizing. This lets the browser handle the crop on the full-resolution image, preserving the natural look.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. **Element image optimization (line 77-81):** Remove the type-based split and use quality-only optimization for all element types: `getOptimizedUrl(element.image, { quality: 60 })`. No more `width: 200` for any element.

2. **Carousel preloader URLs (line 160-163):** Same change -- all elements use `getOptimizedUrl(el.image!, { quality: 60 })`.

3. **Recipe preloader URLs (line 287-290):** Same change -- all elements use `getOptimizedUrl(el.image!, { quality: 60 })`.

### What this fixes
- Product chip thumbnails will show the full product image without cropping
- Scene chip thumbnails will show the full scene without cropping
- Model circles remain correctly showing faces (already quality-only)

### What stays the same
- All animations, transitions, shimmer placeholders
- Background image positioning (`object-top`)
- The `object-cover` fit mode on chip images (correct for filling the frame)
