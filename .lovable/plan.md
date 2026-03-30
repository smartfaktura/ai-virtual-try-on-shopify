

# Fix Category Showcase Image Loading

## Root Cause

The component renders **all 30 images simultaneously** (stacked with opacity toggling), even though only 4 are visible at once (1 per card). Every image goes through the `/render/image/` transformation endpoint which takes 8-17 seconds per request. This creates a bandwidth stampede — the browser's 6-connection-per-origin limit means images queue up and many haven't loaded by the time the user scrolls to the section, showing broken alt text.

## Plan

### File: `src/components/landing/ProductCategoryShowcase.tsx`

**1. Render only the current + next image instead of all images stacked**

Replace the `images.map()` that renders all images with opacity toggling. Instead, only mount 2 `ShimmerImage` elements: the current one (visible) and the next one (preloading, hidden). This drops simultaneous requests from 30 to 8.

**2. Add `width: 600` to the `s()` helper call**

The category cards are at most ~350px wide on desktop. Requesting full-resolution images through the render endpoint is wasteful. Adding `width: 600` (2x for retina) will dramatically reduce payload size and transformation time.

```ts
const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { width: 600, quality: 60 });
```

**3. Track failed images and skip them permanently**

Currently `onError` calls `advance()` which cycles to the next image — but the failed image stays in the array and will fail again on the next cycle. Add a `Set` of failed indices so broken images are permanently skipped.

**4. Don't start cycling until the section is visible**

Wrap the `setInterval` in an `IntersectionObserver` check so images only start loading and cycling when the user scrolls near the section, preventing the 8 preload requests from competing with above-fold content.

## Files Changed
- `src/components/landing/ProductCategoryShowcase.tsx`

