

# Fix ProductCategoryShowcase for Slow Connections

## Problems
1. All 29 images are rendered as `<img>` in the DOM simultaneously — browser fetches them all at once despite `loading="lazy"` (they're positioned `absolute inset-0` so the browser considers them visible)
2. No `width` param in optimization — full-res images downloaded for ~280px cards
3. Timer advances even if the next image hasn't loaded — shows shimmer mid-transition
4. 29 throwaway `Image()` objects created on mount for cache checks

## Solution

### File: `src/components/landing/ProductCategoryShowcase.tsx`

**Progressive image loading** — only render the current image and preload the next one:
- Keep only 2 `<ShimmerImage>` elements in the DOM at any time: `currentIndex` (visible) and `nextIndex` (hidden, preloading)
- When the next image's `onLoad` fires, mark it as "ready"
- Timer only advances if the next image is ready; otherwise it waits (prevents blank frames on slow connections)

**Add width constraint** to the `s()` helper:
```ts
const s = (path: string) => getOptimizedUrl(
  getLandingAssetUrl(`showcase/${path}`),
  { width: 600, quality: 60 }
);
```
600px covers retina at the card's max ~280px width, cutting file sizes significantly.

**Preload first image eagerly** — set `loading="eager"` on the first (index 0) image of each card so the initial frame appears fast.

### Behavior on slow connections
- Initial load: only 4 images (one per card) + 4 preloads for the next slides
- Each card waits for its next image before transitioning — no blank frames
- Total concurrent requests drops from 29 to ~8

### No changes needed in ShimmerImage or other files

