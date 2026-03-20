

# Fix: Workflow Preview Images in Creative Drops — Show Full Image, Not Zoomed Crop

## Problem
Workflow card thumbnails are `w-14 h-14` (56px) squares with `object-cover`, forcefully cropping the preview images into tiny squares. Combined with `width: 120` optimization, the images look zoomed-in and unrecognizable. Only Picture Perspectives looks okay because it uses a local image that happens to crop well.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Enlarge thumbnail and use natural aspect ratio** (line 920-921)
Change the thumbnail container from a tiny square to a larger rectangle:
- `w-14 h-14` → `w-20 h-24` (80×96px, roughly 5:6 ratio)
- Keep `rounded-xl bg-muted overflow-hidden flex-shrink-0`
- Change `aspectRatio="1/1"` → `aspectRatio="5/6"` on `ShimmerImage`

**B. Remove aggressive width optimization** (line 46)
Change `width: 120` → `width: 200` so images are less compressed at the slightly larger display size.

## Summary
- 1 file, 3 lines changed
- Thumbnails go from 56px squares to 80×96px rectangles showing the full image naturally
