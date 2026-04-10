

# Add "Inside" Angle Reference — Full Plan

## Overview
Add persistent inside/interior image storage for products, and ensure all interior-type scenes trigger the `interiorDetail` reference upload card.

## Changes

### 1. Database Migration — Add column
```sql
ALTER TABLE public.user_products ADD COLUMN inside_image_url text;
```

### 2. Database Data Update — Add missing `interiorDetail` triggers
7 interior-type scenes are missing `interiorDetail` in their `trigger_blocks`. These need updating:
- `interior-detail-shoes`, `interior-detail-shoes-boots`, `interior-detail-shoes-highheels`, `interior-detail-shoes-sneakers` (shoe interiors)
- `lining-interior-jackets` (jacket lining)
- `open-interior-wallets` (wallet open layout)
- `band-interior-rings` (ring band interior)

Each gets `interiorDetail` appended to their existing `trigger_blocks`.

### 3. `ManualProductTab.tsx` (~8 lines)
- Add `insideImage` state alongside `backImage`, `sideImage`, `packagingImage`
- Add "Inside" upload slot in the angle reference grid (with appropriate icon)
- Save as `inside_image_url` on insert/update
- Load from `editingProduct.inside_image_url` in edit mode

### 4. `StoreImportTab.tsx` (~4 lines)
- Add `{ value: 'Inside', label: 'Inside' }` to `roleOptions`
- Add `insideImageIndex` state
- Save as `inside_image_url` on product insert

### 5. `ProductImages.tsx` (~4 lines)
- Auto-fill `inside_image_url` into `sceneExtraRefs` with key `trigger:interiorDetail` (matching existing pattern for `sideView`, `backView`, etc.)

### 6. Type updates
- `AddProduct.tsx` and `AddProductModal.tsx` — add `inside_image_url` to the Product type interface

## What already works (no changes needed)
- `interiorDetail` trigger is fully defined in `detailBlockConfig.ts` with label, description, and promptLabel
- `ProductImagesStep3Refine.tsx` reference trigger upload system handles any key from `REFERENCE_TRIGGERS` automatically
- Generation workflow passes `sceneExtraRefs` through to the prompt builder

## Files touched
- **Migration**: `user_products` — add `inside_image_url` column
- **Data update**: `product_image_scenes` — add `interiorDetail` trigger to 7 scenes
- `src/components/app/ManualProductTab.tsx`
- `src/components/app/StoreImportTab.tsx`
- `src/pages/ProductImages.tsx`
- `src/pages/AddProduct.tsx`
- `src/components/app/AddProductModal.tsx`

