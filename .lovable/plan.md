

# Add Global "Back Reference Image" Upload via `backView` Trigger Block

## What this does
Adds a new `backView` trigger block option in the admin panel and a global "Back Reference Image" upload card in Step 3 (like the existing Packaging Reference). When any selected scene has the `backView` trigger, users see a prompt to upload a photo of the product's back/rear view. This image is sent as `extra_reference_image_url` to the generation pipeline for all `backView` scenes.

## Changes

### 1. Add `backView` to admin trigger blocks list
**File: `src/pages/AdminProductImageScenes.tsx`**
- Add `'backView'` to the `TRIGGER_BLOCKS` array so admins can assign it to scenes (e.g., "Back View" scene)

### 2. Add `backReferenceUrl` to `DetailSettings` type
**File: `src/components/app/product-images/types.ts`**
- Add `backReferenceUrl?: string` to `DetailSettings` (alongside existing `packagingReferenceUrl`)

### 3. Add global "Back Reference Image" card in Step 3
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- Detect `hasBackViewScenes` — any selected scene with `backView` trigger
- Add upload state/refs (same pattern as packaging reference)
- Render a card right after the packaging reference section:
  - Icon: `RotateCcw` (already imported)
  - Title: "Back view reference"
  - Description: "Some of your selected scenes show the back of your product. Upload a photo of the back for accurate results — otherwise, the AI will interpret the back design on its own."
  - Upload button / thumbnail preview with remove (identical UX to packaging card)
- Upload to `product-uploads` bucket under `back-refs/` path
- Call `update({ backReferenceUrl: url })`

### 4. Wire `backReferenceUrl` into the generation payload
**File: `src/pages/ProductImages.tsx`**
- In the generation loop (line ~404), for scenes with `backView` trigger, inject `extra_reference_image_url: details.backReferenceUrl` (only when the scene has `backView` trigger and no per-scene extra ref already set)
- This uses the existing `extra_reference_image_url` field already handled by the edge function as `[PRODUCT EXTRA ANGLE]`

## Files to modify
- `src/pages/AdminProductImageScenes.tsx` — add `'backView'` to `TRIGGER_BLOCKS`
- `src/components/app/product-images/types.ts` — add `backReferenceUrl` to `DetailSettings`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — detection + upload card UI
- `src/pages/ProductImages.tsx` — inject `backReferenceUrl` as `extra_reference_image_url` for `backView` scenes

## No edge function changes needed
The existing `extra_reference_image_url` → `[PRODUCT EXTRA ANGLE]` pipeline already handles this correctly.

