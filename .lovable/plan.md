

# Fix Seedream Aspect Ratio + Improve Reference Image Handling

## Problems Found

### 1. Wrong aspect ratio (1:1 requested → 4:5 returned)
The Seedream API accepts **two separate parameters**: `size` (resolution preset like "2K") and `aspect_ratio` (like "1:1", "16:9"). Our code only sends `size: "2K"` but never sends `aspect_ratio`, so Seedream picks its own default.

### 2. Model hair color mismatch (brown selected → blonde generated)
Seedream receives all reference images as a flat array via `body.image = [url1, url2, url3]` with no way to distinguish which image is the product, model, or scene. The prompt says "the model from the reference" but Seedream's diffusion model can't reliably map that text to a specific image in the array. This is a fundamental limitation — Seedream treats all images as equal "reference" inputs and blends them freely. We can improve this by **ordering images strategically** (model image first, since Seedream tends to weight earlier images more) and by **strengthening the prompt description** of the model's appearance.

## Solution

### Changes in `supabase/functions/generate-freestyle/index.ts`

**1. Pass `aspect_ratio` to the Seedream API call**
- In `generateImageSeedream()`, add the `aspect_ratio` field to the request body alongside `size`
- Map our app ratios to Seedream's supported values: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9`
- For unsupported ratios (e.g. `4:5`), map to the nearest supported one (`3:4`)

**2. Reorder images in `convertContentToSeedreamInput()`**
- Currently images are collected in arbitrary order from the content array
- Reorder so the **model reference image comes first** in the array — Seedream tends to give more weight to the first image for subject/identity consistency
- This won't guarantee perfect matching but will improve fidelity to the selected model

**3. Add a ratio mapping helper**
```
App ratio → Seedream aspect_ratio
1:1   → "1:1"
16:9  → "16:9"
9:16  → "9:16"
4:3   → "4:3"
3:4   → "3:4"
4:5   → "3:4"  (nearest)
5:4   → "4:3"  (nearest)
3:2   → "3:2"
2:3   → "2:3"
```

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — add `aspect_ratio` param, ratio mapping, image reordering

