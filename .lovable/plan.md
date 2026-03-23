

# Add Product Image Carousel to Product Listing Set Workflow Card

## What
Upload the 7 product showcase images to the `landing-assets` storage bucket, then update the Product Listing Set scene data to use `mode: 'carousel'` with those images as rotating backgrounds — identical to how the Selfie/UGC Set already works.

## Steps

### 1. Upload images to storage
Upload all 7 images to `landing-assets/workflows/product-showcase/` in the storage bucket:
- `Vovvai-products-1.jpg` (fragrance, dark)
- `Vovvai-products-2.jpg` (perfume, marble)
- `Vovvai-products-3.jpg` (body wash, wood)
- `Vovvai-products-4.jpg` (facial oil, model)
- `Vovvai-products-5.jpg` (serum, stone tray)
- `Vovvai-products-6.jpg` (sneakers, green)
- `Vovvai-products-7.jpg` (lamp, water)

### 2. Update `src/components/app/workflowAnimationData.tsx`
- Add 7 new asset URL constants using `getLandingAssetUrl('workflows/product-showcase/...')`
- Change the `'Product Listing Set'` scene definition:
  - Add `mode: 'carousel'`
  - Add `backgrounds: [showcase1, showcase2, ..., showcase7]` array
  - Keep the existing `background` as the first image
  - Keep existing floating elements (badges)

This mirrors exactly how `'Selfie / UGC Set'` uses `mode: 'carousel'` with a `backgrounds` array — the `WorkflowAnimatedThumbnail` component already handles carousel rendering with crossfade transitions.

### Files
- `src/components/app/workflowAnimationData.tsx` — add carousel mode + background URLs

