

# Fix Striped/Broken Previews in Short Film Picker Dialogs

## Root Cause

Every picker card wraps `ShimmerImage` inside a `<div className="aspect-square bg-white">`, then also passes `aspectRatio="1/1"` to `ShimmerImage`. The `ShimmerImage` component creates its own wrapper `<div className="relative overflow-hidden w-full h-full" style={{ aspectRatio: "1/1" }}>`. This double-nesting of aspect-ratio containers causes the inner image to collapse to a thin stripe because `h-full` inside an aspect-ratio parent does not resolve as expected in all layout contexts.

## Fix

Remove the outer wrapper `<div>` from each card's image area. Instead, pass `aspectRatio`, `wrapperClassName` (for background color + rounding), and `object-contain` directly to `ShimmerImage`. This gives ShimmerImage sole control over sizing.

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

**Product picker** (lines 418-425): Replace the wrapping div + ShimmerImage with:
```tsx
<ShimmerImage
  src={getOptimizedUrl(p.image_url, { width: 200, quality: 60 })}
  alt={p.title}
  className="w-full h-full object-contain"
  aspectRatio="1/1"
  wrapperClassName="bg-white rounded-t-lg"
/>
```

**Model picker** (lines 320-327): Same pattern but with `aspectRatio="3/4"` and `bg-muted/30`.

**SceneCard** (lines 442-449): Same pattern with `aspectRatio="1/1"` and `bg-muted/30`.

**Selected reference thumbnails** (wherever they render in the existing refs list): same fix if they also double-wrap.

### Changes summary

| File | Change |
|------|--------|
| `ReferenceUploadPanel.tsx` | Remove outer `<div className="aspect-*">` wrappers from all 3 picker card types + SceneCard; let ShimmerImage own the aspect ratio and background via its `wrapperClassName` and `aspectRatio` props |

