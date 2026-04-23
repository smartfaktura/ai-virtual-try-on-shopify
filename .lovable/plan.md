

## Fix zoomed/cropped scene thumbnails on `/app/admin/recommended-scenes`

### Root cause

Both grids on this page call `getOptimizedUrl(scene.preview_image_url, { width: 320, quality: 60 })` (lines 482 and 695). Per the project's standing rule (`mem://style/image-optimization-no-crop`), Supabase's `width=` render parameter performs a **server-side crop-zoom**, not a fit-resize, so 4:5 portrait scenes get their centers blown up — exactly what the screenshot shows.

### Fix

Drop the `width` parameter from both calls — keep `quality: 60` only. The image element already constrains size via `w-full aspect-[4/5] object-cover`, so the browser handles sizing while the image keeps its full original framing.

```ts
// Before
src={getOptimizedUrl(scene.preview_image_url, { width: 320, quality: 60 })}

// After
src={getOptimizedUrl(scene.preview_image_url, { quality: 60 })}
```

Two identical edits in `src/pages/AdminRecommendedScenes.tsx`:
- Line 482 (preview rail)
- Line 695 (main scene picker grid)

### Files touched

```text
EDIT  src/pages/AdminRecommendedScenes.tsx   remove width: 320 from both getOptimizedUrl calls
```

No DB, no edge function, no other surfaces affected.

### Validation

1. `/app/admin/recommended-scenes` reloads — every scene tile shows the full composition (model + product framed correctly), not a center-crop close-up.
2. Featured preview rail and the "All scenes" grid both render at correct framing.
3. Network tab: thumbnail URLs end with `?quality=60` (no `width=` param).

