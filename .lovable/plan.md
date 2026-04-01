

# Optimize Video Hub Grid Bandwidth

## Problem
Grid thumbnails load full-resolution source images (only `quality: 60`, no width limit), and hover videos preload entire 20MB+ files immediately.

## Changes — `src/pages/VideoHub.tsx` only

### 1. Constrain thumbnail width
The grid cards are ~300px CSS wide (600px at 2x retina). Change both the `<img>` and `<video poster>` calls from:
```
getOptimizedUrl(video.source_image_url, { quality: 60 })
```
to:
```
getOptimizedUrl(video.source_image_url, { width: 400, quality: 50 })
```
This uses the existing Supabase render/image transform endpoint to serve a ~400px thumbnail instead of the full-res original — drastically smaller file sizes.

### 2. Stop pre-fetching the full video
Change `preload="auto"` → `preload="none"` on the `<video>` element. The 20MB file will only start downloading when `play()` is called on hover, not when the element mounts.

### 3. Add `decoding="async"` to the thumbnail `<img>`
Matches the `ShimmerImage` pattern used elsewhere — prevents main-thread blocking during image decode.

**3 lines changed, 1 file. No backend or schema changes.**

