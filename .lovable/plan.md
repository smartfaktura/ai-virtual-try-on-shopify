

# Fix Invisible Shimmer on Scene Card Preview Images

## Problem
Scene cards in the Shots step use `ShimmerImage` for preview images, but the shimmer animation is invisible because:
- The parent container has `bg-muted` background
- The shimmer gradient uses `from-muted/40 via-muted/70 to-muted/40` — nearly identical to the parent, making the loading animation invisible
- While images load, cards appear as static grey boxes indistinguishable from scenes without previews

## Fix

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (line 219-221)

Replace the static `bg-muted` container with a shimmer-aware approach — add an `animate-pulse` fallback on the container and use a more visible shimmer gradient on the `ShimmerImage`:

```tsx
// Before (line 219-221)
<div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
  {scene.previewUrl ? (
    <ShimmerImage src={getOptimizedUrl(scene.previewUrl, { quality: 60 })} alt={scene.title} className="w-full h-full object-cover" loading="lazy" />

// After
<div className="aspect-[3/4] bg-muted/60 flex items-center justify-center relative">
  {scene.previewUrl ? (
    <ShimmerImage
      src={getOptimizedUrl(scene.previewUrl, { quality: 60 })}
      alt={scene.title}
      className="w-full h-full object-cover"
      loading="lazy"
      wrapperClassName="bg-gradient-to-r from-muted/30 via-muted/80 to-muted/30 bg-[length:200%_100%] animate-shimmer"
    />
```

The `wrapperClassName` on `ShimmerImage` gives its wrapper a higher-contrast shimmer sweep that's visible against the lighter `bg-muted/60` parent, providing a clear loading state while images load.

### Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — 1 small change to SceneCard image area

