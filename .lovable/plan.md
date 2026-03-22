

# Fix Scene/Model/Product Thumbnails — Square, No Zoom

## Problem
The scene, model, and product thumbnail images in the Discover detail modal use `object-cover`, which crops and zooms into the image. User wants them displayed as square thumbnails showing the full image without cropping.

## Changes

### 1. `src/components/app/DiscoverDetailModal.tsx`
Change all three thumbnail images from `object-cover` to `object-contain` and add a subtle background so the contain area looks clean:

- **Scene** (line 165): `w-10 h-10 rounded-lg object-cover` → `w-10 h-10 rounded-lg object-contain bg-muted/30`
- **Model** (line 180): `w-10 h-10 rounded-full object-cover` → `w-10 h-10 rounded-lg object-contain bg-muted/30` (also change from `rounded-full` to `rounded-lg` for consistency as square)
- **Product** (line 195): `w-10 h-10 rounded-lg object-cover` → `w-10 h-10 rounded-lg object-contain bg-muted/30`

### 2. `src/components/app/PublicDiscoverDetailModal.tsx`
Mirror same changes:
- Scene (line 108), Model (line 123), Product (line 138) — same `object-cover` → `object-contain bg-muted/30`, model `rounded-full` → `rounded-lg`

Two files, 6 class changes total.

