

# Fix Product Thumbnails — Quality-Only Optimization + object-cover

## Root Cause

The problem has two parts working against each other:

1. **`width=200` resize** — Supabase resizes the image to 200px wide, which for tall clothing photos (e.g., 800x3000 originals) produces a tiny 200x750 image. This caused the "zoomed in" appearance with `object-cover`.

2. **`object-contain`** — Shows the full image but for tall narrow product photos, it renders as a thin vertical strip inside the square container. This is what you're seeing now.

## Solution

Remove the `width` constraint entirely — use **quality-only** compression (`quality: 60`). This reduces file size by ~70% without changing dimensions, so the image looks identical to the original. Then use **`object-cover`** to fill the square nicely (same as it looked before optimization).

This follows the existing pattern across the app: "quality-only compression (60-75%) and omits width constraints to prevent aspect ratio distortion."

## Changes

### `src/components/app/freestyle/ProductSelectorChip.tsx`

3 places to update:

1. **Trigger chip** (line 69): Already uses `width: 200` — change to quality-only: `getOptimizedUrl(selectedProduct.image_url, { quality: 60 })`

2. **Sample products** (line 127): Change `object-contain bg-muted/30` back to `object-contain bg-muted/30` (samples are local files, not affected by Supabase resize — these are fine as-is)

3. **Product grid** (line 176): Change `{ width: 200, quality: 60 }` to `{ quality: 60 }` and change `object-contain` back to `object-cover`

### Files
- `src/components/app/freestyle/ProductSelectorChip.tsx`

