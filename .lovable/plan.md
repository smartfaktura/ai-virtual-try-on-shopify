

# Product Images Results — Fix White Bars + Add Scene Labels

## Issues

1. **White bars in grid**: Line 76 uses `aspect-[4/5] bg-white` with `object-contain`. When images don't match 4:5, white letterboxing appears. Fix: use `object-cover` so images fill the container, no white gaps.

2. **No scene labels**: `finishWithResults` (line 450) only maps `jobId → productId`. The scene name from the key (`productId_sceneId_vIdx_i`) is lost. Users see 19 images with zero indication of which scene generated each one.

3. **Generation quality issues**: These are prompt/AI quality issues, not code bugs. The generation outputs depend on the AI model's interpretation of prompts. No code fix here — this is iterative prompt tuning per scene template.

## Plan

### File: `src/pages/ProductImages.tsx`

**Enrich productMap with scene names**
- Change `productMap` from `Map<string, string>` (jobId → productId) to `Map<string, { productId: string; sceneName: string }>`
- Parse scene name from the key using `selectedScenes` lookup: `key.split('_')[1]` gives sceneId, find scene title
- Update `finishWithResults` to build enriched results: `Map<string, { images: Array<{ url: string; sceneName: string }>; productName: string }>`
- Apply same change to the "Skip waiting" button handler (~line 827)

### File: `src/components/app/product-images/ProductImagesStep6Results.tsx`

**Fix white bars**
- Line 76: Change `aspect-[4/5] bg-white` → `aspect-square bg-muted/30`
- Line 80: Change `object-contain` → `object-cover`

**Add scene labels**
- Update `Step6Props` interface to accept enriched results type with per-image `{ url, sceneName }`
- Render a small text label or badge with `sceneName` below each image thumbnail
- Update `allImages`, `openLightbox`, and `handleDownloadAll` to work with the new structure

## Files

| File | Changes |
|---|---|
| `src/pages/ProductImages.tsx` | Enrich productMap with scene names, update finishWithResults |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | Fix aspect ratio / object-fit, add scene name badges |

