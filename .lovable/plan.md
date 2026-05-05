## Problem

The `ScenePreviewThumb` component on `/app/admin/product-image-scenes` loads full-resolution images (often 2K PNGs) for tiny 40x40px thumbnails. This wastes bandwidth and slows down the page significantly when hundreds of scenes are listed.

## Solution

Update `ScenePreviewThumb` to accept an optional `thumbSize` prop and use `getOptimizedUrl` from `src/lib/imageOptimization.ts` to request appropriately sized images from Supabase Storage's render endpoint.

### Changes

**`src/components/admin/ScenePreviewThumb.tsx`**
- Import `getOptimizedUrl` from `@/lib/imageOptimization`
- Add optional `thumbSize` prop (number, default ~120)
- For Supabase URLs: pass through `getOptimizedUrl` with `width`, `height`, `quality: 50`, `resize: 'cover'` — this is a fixed-size thumbnail so the width param is safe per project conventions
- For external URLs: continue using the image-proxy as before (no optimization available)

**`src/pages/AdminProductImageScenes.tsx`**
- Pass `thumbSize={80}` to `ScenePreviewThumb` in the scene list (the thumbnail container is 40px on desktop / 112px on mobile, so 80px at 2x is sufficient)

**`src/pages/AdminSceneLibrary.tsx`**
- Pass appropriate `thumbSize` values to each `ScenePreviewThumb` usage (48px thumbnails get `thumbSize={96}`, larger previews get `thumbSize={256}`)

This keeps full-size loading as the default for any other consumers while dramatically reducing payload on admin listing pages.
