

# Increase Freestyle Image Resolution

## Problem

Generated images are only ~700KB because Gemini defaults to **1K resolution (1024x1024)**. The API supports up to 4K but we never pass the `image_size` parameter.

## What Gemini Supports

| Resolution | Size | Cost | Notes |
|---|---|---|---|
| 1K | 1024px | default | current behavior |
| 2K | 2048px | ~1.5x cost | good balance |
| 4K | 4096px | ~3.5x cost | only gemini-3.1-flash-image-preview |

The parameter goes inside `image_config` alongside `aspect_ratio`:
```json
{ "image_config": { "aspect_ratio": "1:1", "image_size": "2K" } }
```

Note: 4K is only available on `gemini-3.1-flash-image-preview` (Nano Banana 2). The Pro model (`gemini-3-pro-image-preview`) may not support 4K.

## Proposed Change

### File: `supabase/functions/generate-freestyle/index.ts`

**In `generateImage()` function (line 377-383):**
- Add `image_size` to the `image_config` object
- Map quality setting: `standard` → `"1K"`, `high` → `"2K"`
- This way Standard (4 credits) stays fast/cheap at 1K, and Pro (6 credits) produces 2K images (~2048px) — roughly 4x the pixel count and significantly larger file sizes

```
image_config: {
  ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}),
  image_size: quality === 'high' ? '2K' : '1K',
}
```

### No frontend changes needed
The `quality` field is already passed from the frontend to the edge function.

## Risk
- The Lovable AI gateway proxies to Gemini — need to confirm it passes `image_config.image_size` through. If it doesn't, this would silently have no effect (no breakage).
- 2K images will be larger (~2-4MB PNGs) which increases storage costs and load times, but that's the expected tradeoff for "Pro" quality.

