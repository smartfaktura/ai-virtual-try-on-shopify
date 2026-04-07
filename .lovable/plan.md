

# Add Packaging Reference Upload to Step 3 for `packagingDetails` Scenes

## Problem
The packaging reference upload exists in an **orphaned component** (`ProductImagesStep3Details.tsx`) that is no longer rendered. When a scene has the `packagingDetails` trigger block, there is no way for users to upload a packaging reference image in the current Step 3 (Refine). The generation payload supports `packaging_reference_url` and the edge function injects it — but the UI path is broken.

## What to build

### 1. Detect packaging scenes in Step 3
In `ProductImagesStep3Refine.tsx`, check if any selected scene has `packagingDetails` in its `triggerBlocks`. If yes:

- Show an **info banner** in the "Selected shots" section: *"Some of your selected scenes include packaging. Upload a photo of your packaging for more accurate results — otherwise, the AI will interpret packaging design on its own."*
- Show a **single packaging upload area** (not per-scene — packaging is global across all packaging scenes) with the same compact design as the existing extra reference upload.

### 2. Wire packaging reference state
In `ProductImages.tsx`:
- The `details` state already has `packagingReferenceUrl` in `DetailSettings` type — just need to make sure Step3Refine can set it.
- Pass `details.packagingReferenceUrl` and an `onPackagingRefChange` callback to Step3Refine.
- The generation payload already sends `packaging_reference_url` from `details.packagingReferenceUrl` (line 403) — no change needed there.

### 3. Upload to storage (not base64)
The old orphaned component used base64 `FileReader`. Match the pattern used by the existing `requiresExtraReference` upload — upload to `product-uploads` bucket under `{userId}/packaging-refs/{timestamp}.{ext}` and store the public URL.

### 4. Edge function — already working
`generate-workflow/index.ts` already handles `packaging_reference_url` (line 1209-1211) and injects it as a `[PACKAGING REFERENCE]` labeled image. No changes needed.

## Files to modify
- **`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — add packaging banner + upload area when any selected scene has `packagingDetails` trigger
- **`src/pages/ProductImages.tsx`** — pass packaging ref props to Step3Refine (minor wiring, `details` already has the field)

## No changes needed
- Types — `packagingReferenceUrl` already exists in `DetailSettings`
- Edge function — already handles `packaging_reference_url`
- Database — no schema changes

