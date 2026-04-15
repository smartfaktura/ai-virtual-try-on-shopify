
# Fix missing demo products + picker image framing

## What I found
- The 2 extra demo products were not actually added yet.
- `public/images/demos/` still contains only 7 files.
- `src/components/app/product-images/DemoProductPicker.tsx` still has only 7 items in `DEMO_PRODUCTS`.
- The picker is using a square media box plus `object-contain`, which is why several products look small and don’t visually fill the card.
- These demo images are loaded directly from `public/...`, so they are currently served as raw assets. There is no separate optimization pass for fast preview loading.

## Plan
1. Add the 2 missing demo products
   - Add the chair and handbag assets.
   - Extend `DEMO_PRODUCTS` with:
     - Bouclé Armchair / Furniture
     - Leather Handbag / Bags

2. Split preview images from upload images
   - Keep a higher-quality source image for the actual demo upload flow.
   - Create smaller optimized preview thumbnails just for the picker grid.
   - This keeps the modal fast without weakening the file used for analysis/upload.

3. Fix the card image fit
   - Stop relying on the current square + `object-contain` combo.
   - Use the existing `ShimmerImage` `aspectRatio` prop for a consistent media frame.
   - Switch the picker cards to a more product-friendly ratio and tighter preview framing so items visually fill the tile much better.

4. Polish the picker layout for 9 products
   - Slightly widen the desktop dialog.
   - Keep a clean 2-column mobile / 3-column desktop grid.
   - Preserve the current clean card style, loading state, and category badges.

5. Keep the existing upload/analyze flow
   - On selection, still fetch the demo file as a `File` and pass it into `handleQuickUpload`.
   - No backend or database changes needed.

## Technical details
- `src/components/app/product-images/DemoProductPicker.tsx`
  - add `previewSrc` + `sourceSrc`
  - add chair + handbag entries
  - use `ShimmerImage` with explicit aspect ratio
  - update media/card sizing and dialog width
- `public/images/demos/`
  - add the 2 missing source assets
  - add optimized preview thumbnails for all demo products
- `src/components/ui/shimmer-image.tsx`
  - likely no change needed; the picker can use the existing API correctly

## Expected result
- You will see 9 demo products, not 7.
- The product images will feel properly framed instead of floating small inside oversized placeholders.
- The picker will open faster because it will load lightweight previews, while selection still uses a proper source image for the generation flow.
