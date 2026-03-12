

## Fix Hero Image Loading — Shimmer Flash on Cached Images

### Problem
The `ShimmerImage` component always starts with `loaded = false`, meaning every image shows a shimmer placeholder even when the browser has it cached. In incognito mode (cold cache), images load in unpredictable order — some appear while others remain as grey shimmer boxes, creating the "strange pattern" you see in the screenshot.

The root cause is that `ShimmerImage` never checks if an image is **already loaded** (from cache) when it mounts. The `onLoad` callback fires asynchronously, so there's always at least one render frame showing the shimmer.

### Changes

**1. `src/components/ui/shimmer-image.tsx` — Skip shimmer for cached images**

Add an `onMount` ref callback that checks `img.complete && img.naturalWidth > 0`. If the image is already in the browser cache, set `loaded = true` immediately — no shimmer flash.

```tsx
const imgRef = useRef<HTMLImageElement>(null);

useEffect(() => {
  const img = imgRef.current;
  if (img && img.complete && img.naturalWidth > 0) {
    setLoaded(true);
  }
}, [src]);
```

This single check eliminates the shimmer flash for cached images across the entire app (hero, galleries, everywhere `ShimmerImage` is used).

**2. `src/components/landing/HeroSection.tsx` — Prioritize first 3 images with `eager` + `fetchPriority`**

The first two carousel images load with shimmer because they're large files competing for bandwidth. Ensure the product image and first 2 outputs use `fetchPriority="high"` and `loading="eager"` consistently. Currently `idx < 3` gets eager and `idx < 2` gets high priority — this is correct but the product image preload (`link rel="preload"`) points to `/images/source-crop-top.jpg` (the raw path) while the actual `src` uses `optimizeProduct()` which may return a different URL. Align them so the preload actually matches what's rendered.

### Result
- Cached images (same session, revisiting scenes): instant display, zero shimmer
- Cold cache (incognito): images still shimmer but load in a more predictable order due to proper priority hints
- No more "strange patterns" of some loaded / some shimmer

Two file changes, minimal code.

