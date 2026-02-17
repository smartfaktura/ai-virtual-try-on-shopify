

## Fix Zoomed-In Images in Workflow Previews

### Problem
All background images and small element images (product chips, model circles, scene chips) in the workflow preview cards appear zoomed in / cropped. This is because `object-cover` is used, which scales images to fill their container and crops whatever doesn't fit. Combined with `object-top` positioning and the ken-burns scale animation, images lose significant portions of their content.

### Solution
Change the background images from `object-cover object-top` to `object-cover object-center` so they show the center of the image rather than being anchored to the top (which cuts off important content). Additionally, remove the ken-burns zoom animation that further scales images by 5%.

For the small floating element images (product/scene chips and model circles), switch from cropping (`object-cover`) to fitting (`object-contain`) so the full image is visible in the chip thumbnail.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. **Background images (recipe mode, line ~323):** Change `object-cover object-top` to `object-cover object-center` so images are centered instead of anchored to the top edge
2. **Background images (carousel mode, lines ~184, ~191):** Same change -- `object-cover object-top` to `object-cover object-center`
3. **Ken-burns animation (line ~327):** Remove the `wf-ken-burns` animation that scales images to 1.05x, causing additional zoom
4. **Product/scene chip images (line ~87):** Change from `object-cover` to `object-contain bg-neutral-50` so full product/scene images are visible in the chip without cropping
5. **Model circle images (line ~111):** Keep `object-cover` for model portraits (face crops look correct with cover) but ensure no extra zoom

### What stays the same
- The floating element animations (slide-in, pop, etc.)
- The carousel crossfade behavior
- The gradient overlays and "Generated" badge
- The shimmer loading placeholders

