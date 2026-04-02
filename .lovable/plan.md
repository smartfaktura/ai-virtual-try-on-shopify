

# Use Uploaded Images for Catalog Studio Carousel (0.5s interval)

## Overview
Replace the current Catalog Studio carousel backgrounds with the 10 uploaded Filippa K jacket images, and make the carousel cycle every 500ms instead of 2500ms.

## Changes

### 1. Copy 10 images to `public/images/catalog-studio/`
Copy all uploaded `VOVVAI-Catalog-Studio-{1..10}.jpg` files to `public/images/catalog-studio/`.

### 2. Add `interval` to `WorkflowScene` type
In `WorkflowAnimatedThumbnail.tsx`, add optional `interval?: number` to the `WorkflowScene` interface.

### 3. Use `scene.interval` in `CarouselThumbnail`
Change line 240 from `const INTERVAL = 2500;` to `const INTERVAL = scene.interval ?? 2500;` — pass the scene's custom interval through. The progress bar animation duration already references `INTERVAL` so it will auto-adjust.

### 4. Update `workflowAnimationData.tsx` — Catalog Studio entry
- Replace `backgrounds` array with paths to the 10 new images in `/images/catalog-studio/`
- Set `interval: 500` for fast cycling
- Keep existing badge elements (Bulk Generation, Catalog Ready)

### Files modified
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — add `interval` to type + use it
- `src/components/app/workflowAnimationData.tsx` — new image paths + interval
- 10 images copied to `public/images/catalog-studio/`

