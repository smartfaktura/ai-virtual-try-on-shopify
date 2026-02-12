

## Fix Mobile Thumbnail Cropping for Virtual Try-On

### Problem
On mobile, the thumbnail container uses `aspect-[4/3]` (landscape ratio). The Virtual Try-On result image is portrait-oriented (a model wearing a garment), so the landscape crop cuts off the model's face -- the most important part.

### Solution

**`src/components/app/WorkflowCard.tsx`** -- Two changes:

1. **Change mobile aspect ratio from landscape to square**: Replace `aspect-[4/3]` with `aspect-square` on mobile. This gives the portrait result image more vertical room so the face stays visible, while still being compact enough on mobile.

2. **Add `object-top` to the background image in `WorkflowAnimatedThumbnail`**: When the image is cropped by `object-cover`, prioritize the top of the image (where the face is) instead of the center.

**`src/components/app/WorkflowAnimatedThumbnail.tsx`** -- One change:

3. **Add `object-top` class to the background `<img>`**: Change `object-cover` to `object-cover object-top` on the background image element (line ~128) so face/head area is always prioritized during cropping.

### Result
- Mobile: square thumbnail shows the model's face clearly
- Desktop: unchanged (`aspect-[3/4]` portrait already works well)
- All other workflows benefit from the same top-anchored cropping

### Files Changed
- **Edit**: `src/components/app/WorkflowCard.tsx` -- line 73: `aspect-[4/3]` to `aspect-square`
- **Edit**: `src/components/app/WorkflowAnimatedThumbnail.tsx` -- background img: add `object-top`
