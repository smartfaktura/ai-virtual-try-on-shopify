
## Optimize Image Loading: Thumbnails + Caching

### The Problem

All galleries (Library, Discover, Freestyle) load full-resolution images for small grid thumbnails. A single AI-generated image can be 1-4MB. Loading 50+ of these in a gallery causes slow page loads, high bandwidth usage, and poor UX -- especially on mobile.

### The Solution

Use Supabase Storage Image Transformations to serve smaller, lower-quality thumbnails in gallery views, and only load full-resolution images when users click to view details or download.

### How It Works

Supabase Storage supports on-the-fly image resizing by changing `/object/` to `/render/image/` in the URL and adding `width` and `quality` query params. For example:

```text
BEFORE (full res, ~2MB):
https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/user/img.png

AFTER (thumbnail, ~50KB):
https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/freestyle-images/user/img.png?width=400&quality=60
```

The browser also caches these transformed images automatically via standard HTTP caching headers that Supabase sets on transformed images.

### Changes

**1. New utility: `src/lib/imageOptimization.ts`**

Create a helper function that converts any Supabase Storage public URL into a thumbnail URL:

- `getOptimizedUrl(url, { width, quality })` -- replaces `/object/` with `/render/image/` and appends width/quality params
- Only transforms Supabase Storage URLs (passes through external URLs unchanged)
- Default thumbnail preset: `width=400, quality=60` (good for grid cards)
- Medium preset: `width=800, quality=75` (for detail modals)
- Returns original URL unchanged for non-Supabase URLs

**2. `src/components/app/LibraryImageCard.tsx`**

- Use `getOptimizedUrl(item.imageUrl, { width: 400, quality: 60 })` for the `<img src>` in the grid card
- The original `item.imageUrl` stays untouched for downloads and detail views

**3. `src/components/app/DiscoverCard.tsx`**

- Use `getOptimizedUrl(imageUrl, { width: 400, quality: 60 })` for the grid thumbnail `<img src>`

**4. `src/components/app/freestyle/FreestyleGallery.tsx`**

- For the masonry grid cards, use `getOptimizedUrl(img.url, { width: 400, quality: 60 })`
- Keep original URLs for the lightbox/expanded view

**5. `src/components/app/RecentCreationsGallery.tsx`**

- Apply same thumbnail optimization for the recent creations carousel

**6. Detail modals keep full quality**

- `LibraryDetailModal`, `DiscoverDetailModal`, and `ImageLightbox` continue using original URLs so users see full-resolution images when they click to view

### What About Caching?

Supabase Storage already sets `Cache-Control` headers on served images. Transformed images are cached both at the CDN level and in the browser. No additional caching setup is needed -- once a thumbnail is loaded, the browser will serve it from cache on subsequent visits.

### Safety Considerations

- No database changes required
- No edge function changes
- Only affects `<img src>` attributes in grid/card views
- Downloads always use the original full-resolution URL
- If the `/render/image/` endpoint is unavailable (e.g., plan limitations), the utility gracefully falls back to the original URL since the image still loads -- just at full size
- Non-Supabase URLs (external images) are passed through unchanged

### Expected Impact

- Gallery thumbnails: ~50-100KB each instead of ~1-4MB (20-40x smaller)
- Page load time for galleries with 50 images: ~2.5-5MB instead of ~50-200MB
- First meaningful paint significantly faster
- Mobile data usage drastically reduced
