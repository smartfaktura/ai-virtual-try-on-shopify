

# Optimize Workflow Animation Background Images

## Problem
The workflow card animations load full-size, unoptimized background images. Three out of four animation modes skip `getOptimizedUrl` on their backgrounds, causing unnecessarily large downloads and slow loading on the Workflows page.

| Mode | Background optimized? |
|---|---|
| Recipe (default) | No — line 654 uses raw `bgSrc` |
| Carousel (UGC, Perspectives) | No — line 188 uses raw `backgrounds[current]` |
| Upscale | No — line 279 uses raw `bgSrc` |
| Staging | Yes — already optimized (lines 422-425) |

These are thumbnail-sized previews inside cards (~45% of card width), so they only need ~500px wide images at quality 60, not the full 2K originals.

## Changes — `src/components/app/WorkflowAnimatedThumbnail.tsx`

### 1. CarouselThumbnail — optimize background URLs
Add a `useMemo` to map all `backgrounds` through `getOptimizedUrl({ width: 600, quality: 60 })`, then use the optimized array for rendering.

### 2. Recipe mode (main component) — optimize bgSrc
Wrap `bgSrc` with `getOptimizedUrl({ width: 600, quality: 60 })` before passing to the `<img>`.

### 3. UpscaleThumbnail — optimize background
The upscale demo uses the same image for both blur and sharp layers. Optimize it with `getOptimizedUrl({ width: 600, quality: 60 })`. The "blur vs sharp" visual effect is CSS-only (blur filter), so a smaller source image works fine.

### Summary
Single file change. Add `getOptimizedUrl` calls to three locations that currently serve raw full-size images as card thumbnails. This should dramatically reduce initial payload on the Workflows page.

