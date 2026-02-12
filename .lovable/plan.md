

## Fix: Quality-Only Optimization (Keep Native Resolution)

### What's Wrong

The current `getOptimizedUrl` defaults to `width=400`, which downscales every image to 400px wide. This breaks the visual quality of previews, especially in the Freestyle "natural" layout where images display large. The aspect ratios look "crashed" because the images are being resized to a fixed width.

### What Changes

**1. `src/lib/imageOptimization.ts`**
- Remove the default `width=400` -- make `width` truly optional
- When no `width` is provided, only append `quality=X` to the URL (keeps native resolution)
- Default quality stays at `60` for grid previews

**2. `src/components/app/freestyle/FreestyleGallery.tsx`**
- Natural layout (1-3 large images): use `getOptimizedUrl(img.url, { quality: 75 })` -- lighter compression since images display large
- Grid/masonry layout (4+ images): use `getOptimizedUrl(img.url, { quality: 60 })` -- heavier compression for small cards

**3. `src/components/app/LibraryImageCard.tsx`**
- Change to `getOptimizedUrl(item.imageUrl, { quality: 60 })` -- remove width, quality-only

**4. `src/components/app/DiscoverCard.tsx`**
- Change to `getOptimizedUrl(imageUrl, { quality: 60 })` -- remove width, quality-only

**5. `src/components/app/RecentCreationsGallery.tsx`**
- Change to `getOptimizedUrl(item.imageUrl, { quality: 60 })` -- remove width, quality-only

**6. `src/components/app/ImageLightbox.tsx`**
- Main image (line 105): keep using original URL -- full quality on click (already correct)
- Thumbnail strip (line 161): add `getOptimizedUrl(img, { width: 100, quality: 50 })` -- these are tiny 56px thumbnails, width resize is fine here

### Result

- Grid previews: native resolution, 60% quality (smaller files, sharp images)
- Large previews: native resolution, 75% quality (minimal visual loss)
- Lightbox/detail view: full 100% quality original URL (loads on click)
- Thumbnail strip: 100px wide, 50% quality (tiny thumbnails, fast load)
