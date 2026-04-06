

# Admin Product Image Scenes — Image Upload & Preview Integration

## What we're building
Add image upload capability to the admin scene manager so admins can upload preview images directly (instead of pasting URLs), and show those previews as thumbnails in the scene list rows. Also wire scene cards in the user-facing Step 2 to display these uploaded previews.

## Changes

### 1. Admin page: Add image upload to SceneForm
**File: `src/pages/AdminProductImageScenes.tsx`**
- Replace the "Preview Image URL" text input with a combined upload + URL field
- Add a file input (`<input type="file" accept="image/*">`) with an "Upload" button
- On file select, upload to `product-uploads` bucket under path `scene-previews/{scene_id}-{timestamp}.{ext}`, get public URL, set it as `preview_image_url`
- Show a small thumbnail preview next to the field when a URL is set
- Keep the URL input as fallback for pasting external URLs
- Use `useFileUpload` hook or inline Supabase storage upload

### 2. Admin page: Show preview thumbnails in scene list rows
**File: `src/pages/AdminProductImageScenes.tsx`**
- In each scene row (lines ~283-312), add a small 40×40 rounded thumbnail before the title
- If `scene.preview_image_url` exists, show the image; otherwise show a Camera placeholder icon
- This gives admins immediate visual feedback on which scenes have previews

### 3. Step2 scene cards: Already wired
The `SceneCard` component in `ProductImagesStep2Scenes.tsx` already reads `scene.previewUrl` and renders it (line 87). The `dbToFrontend` function in `useProductImageScenes.ts` maps `preview_image_url` → `previewUrl` (line 35). So once images are uploaded via admin, they'll automatically appear on user-facing scene cards. **No changes needed here** — just verify the data flow works.

### 4. Step2: Use dynamic scenes from hook instead of hardcoded imports
**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**
- Currently imports `GLOBAL_SCENES` and `CATEGORY_COLLECTIONS` from `sceneData.ts` (hardcoded)
- Switch to importing from `useProductImageScenes` hook so admin changes (including uploaded images) are reflected
- Keep hardcoded data as fallback (already handled by the hook)

### 5. Storage: Use existing `product-uploads` bucket
The `product-uploads` bucket is already public. Scene preview images will be uploaded under a `scene-previews/` prefix within it. No new bucket or migration needed.

## Files

| File | Action |
|---|---|
| `src/pages/AdminProductImageScenes.tsx` | Add upload UI + thumbnails in list rows |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Switch from hardcoded to hook-based scene data |

