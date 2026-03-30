

# Fix Zoomed Images & Stuck Carousel

## Problems
1. **Zoomed-in images** — `width: 600` in the `s()` helper forces server-side resize, which combined with `object-cover` on 3:4 cards causes aggressive cropping. Project convention is quality-only compression.
2. **Carousel stops cycling** — `ShimmerImage` detects cached images in its state initializer and skips the browser `onLoad` event. The parent's `onLoad` callback never fires for cached images, so `nextReady` stays `false` forever after the first cycle.

## Fix

### File: `src/components/landing/ProductCategoryShowcase.tsx`

**1. Remove width from `s()` helper** (line 88):
```ts
// Before
const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { width: 600, quality: 60 });

// After
const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(`showcase/${path}`), { quality: 60 });
```

**2. Fix carousel cycling** — stop relying on `ShimmerImage`'s `onLoad` for cached images. Instead, use a plain `<img>` element (hidden, `opacity: 0`) for the preload, with a direct `onLoad` handler. Or simpler: use a standalone `Image()` object to preload the next URL and call `setNextReady(true)` when it completes (handles both cached and uncached cases):

```ts
// Replace the "advance" + "preload next" logic:
useEffect(() => {
  const img = new Image();
  img.src = images[nextIndex];
  if (img.complete) {
    setNextReady(true);
  } else {
    img.onload = () => setNextReady(true);
    img.onerror = () => setNextReady(true); // skip broken images
  }
  return () => { img.onload = null; img.onerror = null; };
}, [currentIndex, images, nextIndex]);
```

Remove the hidden `ShimmerImage` for the next image entirely — the `Image()` object handles preloading. Keep only the visible current image `ShimmerImage`.

### No changes to `ShimmerImage` component
The fix is isolated to `CategoryCard` in `ProductCategoryShowcase.tsx`.

