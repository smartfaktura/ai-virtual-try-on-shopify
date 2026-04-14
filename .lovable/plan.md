

# Fix Zoomed Product Images in Short Film Picker

## Problem
The "Pick from Products" dialog in `/app/video/short-film` passes `{ width: 200, quality: 60 }` to `getOptimizedUrl`, which forces the CDN to crop/resize to 200px. When displayed in the grid at a larger size, this causes a blurry, zoomed-in appearance.

The `/app/products` page uses `getOptimizedUrl(product.image_url, { quality: 70 })` with **no width constraint** — this is why products look correct there.

## Fix

**File**: `src/components/app/video/short-film/ReferenceUploadPanel.tsx` (line 399)

Change:
```typescript
src={getOptimizedUrl(p.image_url, { width: 200, quality: 60 })}
```
To:
```typescript
src={getOptimizedUrl(p.image_url, { quality: 70 })}
```

This matches the `/app/products` grid exactly — no forced width, same quality level, same `object-cover` fit.

One line change, one file.

