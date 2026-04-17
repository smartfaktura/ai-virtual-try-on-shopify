

## Issues
1. **Cropped/zoomed model thumbnails** — `getOptimizedUrl(url, { width: 128 })` triggers server-side crop zoom (per project memory `image-optimization-no-crop`). Result: thumbs show only nose / eye / lips.
2. **Wrong models** — hardcoded Yuki/Amara/Sofia/Marcus from landing-asset paths, not the real top globalModels (`mockModels`) shown in `/app/generate/product-images`.
3. **Wrong scenes** — used landing `poses/*` images (full body crops), not actual product-images scenes from the DB.

## Fix — single file: `ProductVisualsGuide.tsx`

### 1. Use real top models from `mockModels`
Import `mockModels` from `@/data/mockData` and take the first 4 (matches the priority order shown in the actual model picker):
- **Freya** · `model_029`
- **Zara** · `model_031`
- **Anders** · `model_018`
- **Sienna** · `model_033`

These are the same names users see at the top of Step 3 Refine model grid.

### 2. Use real DB scenes (4 hardcoded URLs from `product_image_scenes`)
Picked 4 visually distinct, editorial/lifestyle ones with confirmed `preview_image_url`:
- **On-Model Editorial** — `on-model-editorial-garments`
- **Movement Shot** — `movement-shot-garments-dresses`
- **In-Hand Lifestyle** — `in-hand-lifestyle-fragrance`
- **Editorial Jackets** — `on-model-editorial-garments-jackets`

Hardcode the URLs as a static array (no extra fetch — keeps the guide page snappy and matches what the wizard ships).

### 3. Fix the crop zoom — drop `width` param everywhere
Per memory: `Image optimization: quality-only for backgrounds/carousels. Never use width param — causes server-side crop zoom.`

Change in this component:
- Models: `getOptimizedUrl(url, { quality: 65 })` (was `{ width: 128, quality: 65 }`)
- Scenes: `getOptimizedUrl(url, { quality: 65 })` (was `{ width: 240, quality: 65 }`)

Container sizes stay the same (16×16 round model thumbs, 3:4 scene cards) — the browser handles down-rendering. Result: full faces visible, full scene compositions visible.

### 4. Bonus polish
- Make model thumbs slightly larger (`w-20 h-20` round) so the full face has room to breathe.
- Add `object-cover object-top` for models so heads/faces sit in frame even with portrait crops.

## Files
- `src/components/app/learn/ProductVisualsGuide.tsx` — replace `EXAMPLE_MODELS` + `EXAMPLE_SCENES` arrays, fix `getOptimizedUrl` calls, bump model thumb size, add `object-top`.

No other files touched. No new dependencies. No DB changes.

## Acceptance
- Model thumbnails show full faces (not cropped to nose / lips)
- Names shown match what users actually see in Product Visuals Step 3 (Freya, Zara, Anders, Sienna)
- Scene cards show real editorial product-images previews (not landing-page body crops)
- All 8 thumbnails load via quality-only optimization
- No layout shifts on mobile

