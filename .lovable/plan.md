

# Fix Product Image Cropping in Creative Drops Wizard (Step 3/5)

## Problem
Product images in the Creative Drops wizard use `object-cover` inside `aspect-square` containers. Products with non-square aspect ratios (tall bottles, wide items) get heavily cropped/zoomed, cutting off important parts of the image.

## Fix

**File: `src/components/app/CreativeDropWizard.tsx`**

Change `object-cover` to `object-contain` for product images in both grid and list views so the full product is always visible within the thumbnail:

1. **Grid view product image** (line ~690): Change `object-cover` → `object-contain` on the `<img>` tag
2. **List view product image** (line ~720 area): Same change if applicable

This keeps the `aspect-square` container and `bg-muted` background but shows the entire product image fitted inside, matching how product thumbnails typically work in e-commerce UIs.

