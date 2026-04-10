

# Add "Texture" Reference Trigger for Beauty Products

## Problem
Beauty scenes like "Texture Swatch" and "Application Shot" render product texture (cream, gel, serum) without any reference — the AI guesses. A texture photo (e.g., a smear of cream on glass, a dropper showing serum consistency) would dramatically improve accuracy.

## Changes

### 1. Database Migration — Add column
```sql
ALTER TABLE public.user_products ADD COLUMN texture_image_url text;
```

### 2. Database Data Update — Add `textureDetail` trigger to 4 beauty scenes
- `texture-swatch-beauty` — Texture Swatch (skincare)
- `application-shot-beauty` — Application Shot (skincare)
- `swatch-detail-makeup` — Swatch Detail (makeup)
- `application-shot-makeup` — Application Shot (makeup)

Each gets `textureDetail` appended to their existing `trigger_blocks`.

### 3. `detailBlockConfig.ts` — Add trigger definition
Add `textureDetail` to `REFERENCE_TRIGGERS`:
```typescript
textureDetail: {
  key: 'textureDetail',
  label: 'Upload texture/swatch photo',
  description: 'Upload a photo showing the product texture — cream smear, serum drop, gel swatch — so the AI can accurately render consistency and transparency.',
  promptLabel: 'Product texture reference — use this to accurately render the cream/gel/serum consistency, color, and transparency:',
},
```

### 4. `ManualProductTab.tsx` (~6 lines)
- Add `textureImage` state alongside existing angle states
- Add "Texture" upload slot in the reference grid (with `Droplets` icon)
- Save as `texture_image_url` on insert/update
- Load from `editingProduct.texture_image_url` in edit mode

### 5. `StoreImportTab.tsx` (~4 lines)
- Add `{ value: 'Texture', label: 'Texture' }` to `roleOptions`
- Add `textureImageIndex` state
- Save as `texture_image_url` on product insert

### 6. `ProductImages.tsx` (~4 lines)
- Auto-fill `texture_image_url` into `sceneExtraRefs` with key `trigger:textureDetail`

### 7. Type updates
- `AddProduct.tsx` and `AddProductModal.tsx` — add `texture_image_url` to the Product type interface

## What already works (no changes needed)
- `ProductImagesStep3Refine.tsx` reference trigger upload system handles any key from `REFERENCE_TRIGGERS` automatically
- Generation workflow passes `sceneExtraRefs` through to the prompt builder

## Files touched
- **Migration**: `user_products` — add `texture_image_url` column
- **Data update**: `product_image_scenes` — add `textureDetail` trigger to 4 beauty scenes
- `src/components/app/product-images/detailBlockConfig.ts` — new trigger definition
- `src/components/app/ManualProductTab.tsx` — Texture upload slot
- `src/components/app/StoreImportTab.tsx` — Texture role option
- `src/pages/ProductImages.tsx` — auto-fill texture reference
- `src/pages/AddProduct.tsx` — type update
- `src/components/app/AddProductModal.tsx` — type update

