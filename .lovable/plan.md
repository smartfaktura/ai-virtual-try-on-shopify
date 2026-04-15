

# Optimize Step 2 & 3 Scene Images — Quality Only

## The Rule (from `mem://style/image-optimization-no-crop`)

**Never use `width` parameter** on `getOptimizedUrl` for scene preview cards, hover popups, or any image displayed with `object-cover` / `object-contain` in a flexible container. The `width` param triggers Supabase server-side cropping which causes the zoomed-in issue we fixed on workflow cards.

The **only** safe use of `width` is for tiny fixed-size avatars (24-28px product chips in category tabs) where the container is a known small square.

## Changes

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

1. **Scene card previews** — Replace raw `<img>` with `ShimmerImage` + `getOptimizedUrl(url, { quality: 60 })`. No width. Add `loading="lazy"`.
2. **Category tab product thumbnails (24px avatars)** — These are tiny fixed squares, safe to use `width: 40, quality: 40`.
3. Add imports for `ShimmerImage` and `getOptimizedUrl`.

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. **24px scene icons** — `width: 40, quality: 40` (fixed tiny thumbnail, safe).
2. **120px hover popups** — `quality: 60` only. No width.
3. **Scene cards** — `quality: 60` only. No width.

### File: `src/components/app/product-images/ProductImagesStep3Details.tsx`

1. Same pattern — `quality: 60` for previews, `width: 40` only for ≤28px icons.

## Summary

| Image type | Width param? | Quality | Why |
|---|---|---|---|
| Scene card (~150-200px) | **NO** | 60 | Flexible container, would crop |
| Hover popup (~120px) | **NO** | 60 | Flexible container, would crop |
| 24px avatar/icon | Yes, 40 | 40 | Fixed tiny square, safe |

3 files updated. Zero risk of the zoom/crop issue.

