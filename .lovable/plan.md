

# Fix: Product Thumbnail Not Filling Frame

## Problem
The `ProductThumbnail` component uses `object-contain`, which preserves the full image but leaves white gaps around non-square product photos. The user wants it to fill the container fully with minimal cropping.

## Change

**File: `src/components/app/product-images/ProductThumbnail.tsx`**

Change `object-contain` to `object-cover` on the `ShimmerImage` (line 27). This makes the image fill the entire thumbnail container, cropping only the minimum needed to eliminate white gaps. The `p-0.5` inner padding can also be removed to maximize image area.

| Before | After |
|--------|-------|
| `className="w-full h-full object-contain"` | `className="w-full h-full object-cover"` |
| `p-0.5` on wrapper | removed |

Single-line change in one file.

