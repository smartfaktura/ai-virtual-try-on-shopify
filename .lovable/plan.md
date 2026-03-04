

## Fix Grey Space on Interior/Exterior Staging Images in Library

### Root Cause

`LibraryImageCard` applies a **fixed aspect-ratio CSS class** to the card container based on the `ratio` field from `generation_jobs`. Interior/Exterior Staging generates images at the **source photo's native dimensions** (random ratios like 4:3, 3:2, etc.) — but `getAspectClass()` maps any unrecognized ratio to the default `aspect-[3/4]`. The image itself renders at natural size (`h-auto`), so it doesn't fill the taller 3:4 container → grey gap.

### Fix — 2 files

**1. `src/components/app/LibraryImageCard.tsx`**
- Remove the fixed `getAspectClass()` from the card container. In a masonry column layout, cards should size naturally based on image content.
- Change the image to `w-full h-auto` (already is) but remove the container's forced aspect ratio.
- Keep the aspect ratio only on the `ShimmerImage` placeholder so the shimmer still has height before the image loads.

Specifically:
- Remove `getAspectClass(item.aspectRatio)` from the container div's className
- The container should just be `relative rounded-lg overflow-hidden cursor-pointer bg-muted transition-all` — no forced aspect ratio
- The ShimmerImage already handles its own placeholder aspect ratio, so shimmer still works

**2. `src/components/ui/shimmer-image.tsx`**
- Currently the wrapper drops `aspectRatio` once loaded (`!loaded ? { aspectRatio } : undefined`). This is correct — once the image loads, the natural dimensions take over and no grey space appears.
- No changes needed here — it already handles this correctly.

### Result
Cards in the masonry grid will size to their actual image dimensions. Standard workflow images (1:1, 3:4, 9:16) still look correct because those images have those exact ratios. Interior/Exterior images render at their true dimensions with no grey padding.

