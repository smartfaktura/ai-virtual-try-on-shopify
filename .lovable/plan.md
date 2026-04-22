

## Optimize thumbnails in Import Scenes modal

The `Import Scenes → {category}` modal at `/app/admin/product-image-scenes` currently loads each scene's full-resolution `preview_image_url` into a tiny 32×32 (Step 1 list) and 40×40 (Step 2 review) `<img>`. With ~860+ scenes, that's hundreds of MB pulled into a dialog where each image is rendered at thumbnail size.

### Fix
Route both thumbnails through the existing Supabase image transformation helper `getOptimizedUrl()` from `src/lib/imageOptimization.ts`, which converts the public storage URL to the `/render/image/` endpoint with a `width` + `quality` parameter. This is the same pattern used everywhere else (e.g. `ProductThumbnail`).

### Files touched
**Edit only** `src/components/app/ImportFromScenesModal.tsx`:
- Import `getOptimizedUrl` from `@/lib/imageOptimization`.
- Line ~270 (Step 1 grid, 32×32 thumb): wrap src with `getOptimizedUrl(scene.preview_image_url || scene.image_url, { width: 96, quality: 60 })` (3× DPR for retina) and add `loading="lazy"` + `decoding="async"`.
- Line ~381 (Step 2 review, 40×40 thumb): wrap with `getOptimizedUrl(config.preview_image_url, { width: 120, quality: 60 })` and add `loading="lazy"` + `decoding="async"`.

That's the entire change — non-Supabase URLs pass through unchanged thanks to the existing guard inside `getOptimizedUrl`.

### Validation
- Open `/app/admin/product-image-scenes` → click **Import scenes**.
- Network tab: each thumbnail request now hits `/storage/v1/render/image/...?width=96&quality=60` and weighs a few KB instead of MB.
- Modal opens noticeably faster, especially when scrolling through the long scene list.
- Visual: thumbnails look identical at the rendered 32/40px size.

### Out of scope
No layout, sorting, or data-fetching changes. No other modals touched.

