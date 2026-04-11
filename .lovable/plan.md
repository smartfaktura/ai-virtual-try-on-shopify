
Fix: The thin “strip” is caused by the wrapper boxes, not the image itself.

Cause
- We switched these previews to `object-contain`, but kept the containers square:
  - product chip at the top of each per-product card (`ProductThumbnail`, `w-14 h-14`)
  - uploaded reference preview (`w-16 h-16` / `w-24 h-24`)
  - generic extra-reference preview (`aspect-square`)
- For tall apparel like jeans, `contain` inside a square box makes the image very narrow. So it looks like a strip.
- This is not the upload being “re-cropped” again; it’s the portrait image being forced into a square frame.

Plan
1. Replace square reference frames with portrait-friendly frames in `src/components/app/product-images/ProductImagesStep3Refine.tsx`
   - generic extra-reference preview
   - single-product reference preview
   - per-product uploaded reference preview
   - per-product product identity preview above the upload area

2. Stop using the current square `ProductThumbnail` shape in this reference UI
   - simplest fix: render a local portrait preview block directly in `ProductImagesStep3Refine.tsx`
   - keep `object-contain object-center`, but give it a taller frame like `aspect-[3/4]` or `aspect-[4/5]`

3. Keep the UI clean and readable
   - subtle neutral background
   - a little inner padding
   - same upload/status UX, just better proportions so garments fill more of the frame naturally

Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- optional cleanup only if needed: `src/components/app/product-images/ProductThumbnail.tsx`

Technical details
```text
Current:
square frame + object-contain = tall product becomes a thin strip

Fix:
portrait frame + object-contain = full garment visible, centered, no crop, no zoom
```

Expected result
- Back view / side view / texture / other reference previews will show the full garment naturally
- The top product preview in each card will no longer look like a vertical strip
- No backend/data changes needed; this is a UI-only fix
