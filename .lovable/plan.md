

## Corrected Plan: Update Environment Showcase (single file edit only)

### Problem with previous attempt
I incorrectly started generating new image files. All scenes already exist in the `freestyle-images` storage bucket with public URLs. No new assets needed.

### What changes
**One file: `src/components/landing/EnvironmentShowcaseSection.tsx`**

- Replace the `ROW_1` and `ROW_2` arrays using existing scene URLs from the `freestyle-images` bucket
- Import `getOptimizedUrl` and wrap all image URLs with `{ width: 400, quality: 60 }`
- Remove the 5 old scenes (Night Neon, Rooftop City, Editorial Movement, Airport Transit, Editorial Artistic)
- Add the new scenes using their existing storage URLs
- Delete the 3 generated `.jpg` files from `public/images/scenes/` that shouldn't have been created

### Scene URLs needed
I need to look up the actual storage URLs for: Earthy Woodland Product, Poolside Chic, Coastal Horizon, Night Drive Glam, Sunlit Botanical Surface, Marble Console Vignette, Prism Glow Showcase, Desert Horizon, Golden Radiance, Desert Sunset, Natural Light Loft, Amber Glow Studio, Velvet Draped Elegance.

These should all be queryable from the `custom_scenes` table or already known freestyle-images URLs.

