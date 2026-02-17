

## Fix Zoomed-In Source Thumbnails in Recent Jobs Table

### Problem

The source image thumbnails in the Recent Jobs table appear zoomed in and cropped because:
1. Server-side image optimization forces a `width: 80` resize, which can distort non-square images
2. CSS `object-cover` crops the image to fill the square container, cutting off parts of the product

### Fix

**File: `src/pages/Dashboard.tsx`**

| Line | Change | Reason |
|------|--------|--------|
| 335 | Remove `width: 80` from `getOptimizedUrl`, keep only `quality: 50` | Preserve original aspect ratio during optimization |
| 344 | Change `object-cover` to `object-contain` | Show the full product image without cropping |

This matches the platform's optimization guidelines: tiny thumbnails should use quality-only optimization to prevent distortion, and `object-contain` ensures the full product is visible within the square container.

