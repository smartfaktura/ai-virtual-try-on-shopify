

# Fix Vertical Line Artifacts on Scene/Model/Product Thumbnails

## Problem
The thumbnails use `getOptimizedUrl(url, { width: 80, quality: 50 })` which forces Supabase to resize the image to 80px width server-side. Portrait-ratio images get heavily squeezed, causing visible vertical line artifacts. The `object-contain` CSS then tries to fit this already-distorted image into a square.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` (lines 163, 178, 193)
Remove the `width` parameter from all three `getOptimizedUrl` calls — keep only quality compression:

```ts
// Before
getOptimizedUrl(url, { width: 80, quality: 50 })

// After  
getOptimizedUrl(url, { quality: 60 })
```

Three line changes in one file. The images will load at natural resolution with quality compression only, and CSS `object-contain` will handle the visual sizing without distortion.

