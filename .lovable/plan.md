

## Fix Broken Chip Images in Workflow Previews

### Problem
The previous change switched product/scene chip thumbnails from `object-cover` to `object-contain bg-neutral-50`. This causes:
- Product and scene images to appear tiny with white padding bars around them instead of filling the chip naturally
- The overall chips look broken and unprofessional

The model circle image optimization at `width: 120` is also too aggressive for a 60px circle that uses `object-cover` cropping -- it can misalign the crop.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. **Product/scene chip images (line 87):** Revert from `object-contain bg-neutral-50` back to `object-cover` -- this is the correct fit mode for small rectangular thumbnails in chips, ensuring they fill the frame without padding
2. **Model circle image optimization (line 77):** Increase the optimization width from 120 to 200 for model portraits used in 60px circles -- 2x resolution gives the browser enough pixels for a clean circular crop without cutting off faces

These are two small class/parameter changes that restore the chip images to their original correct appearance.

