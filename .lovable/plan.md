

# Fix: Chip Thumbnails Not Loading Before Animation on Mobile

## Problem
The chip thumbnails (product, scene) and model avatars are ~16-20px on screen but download at full resolution — only `quality: 50` is applied, no `width` constraint. On mobile networks, these images arrive **after** the animation reveals them (1.5-2.2s), showing broken/empty thumbnails.

## Root Cause
- `getOptimizedUrl()` is called with `{ quality: 50 }` but no `width` — Supabase still serves the full-width image
- Images render at 16-20px but download could be 1000px+ wide
- The animation cycle is only 8 seconds; chips appear at 1.5-2.2s — not enough time for unoptimized images on slow connections

## Fix

### `src/components/landing/FreestyleShowcaseSection.tsx`

**1. Add `width` to all tiny image optimizations** — these render at 20px max, so `width: 40` (2x for retina) is plenty:

```tsx
// MODEL_AVATARS — rendered at 16-20px
{ quality: 50, width: 40 }

// CHIPS thumbs — rendered at 16-20px  
{ quality: 50, width: 40 }
```

**2. Preload chip/avatar images on mount** so they're cached before the animation reveals them. Add an effect that creates `Image()` objects for all 5 tiny URLs at component mount (before the 1.5s delay):

```tsx
useEffect(() => {
  const urls = [
    ...MODEL_AVATARS.map(m => m.src),
    ...CHIPS.map(c => c.thumb).filter(Boolean),
  ];
  urls.forEach(url => { const img = new Image(); img.src = url; });
}, []);
```

This ensures images are in browser cache before chips animate in. Combined with width optimization, each image drops from potentially hundreds of KB to ~1-2 KB.

One file, ~10 lines changed.

