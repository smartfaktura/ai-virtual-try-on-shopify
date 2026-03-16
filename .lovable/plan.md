

## Optimize scene images in the Freestyle scene selector

### Problem
Scene thumbnails in `SceneSelectorChip.tsx` (line 182) use raw `<img>` tags with full-size Supabase Storage URLs — no size optimization and no shimmer loading state. This causes heavy downloads and blank spaces while images load.

### Changes

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`**

1. **Import** `getOptimizedUrl` from `@/lib/imageOptimization` and `ShimmerImage` from `@/components/ui/shimmer-image`

2. **Replace the raw `<img>` tag** (line 182) with `ShimmerImage` + optimized URL:
```tsx
// Before
<img src={pose.previewUrl} alt={pose.name} className="w-full aspect-[4/5] object-cover" />

// After
<ShimmerImage
  src={getOptimizedUrl(pose.previewUrl, { width: 240, quality: 60 })}
  alt={pose.name}
  className="w-full aspect-[4/5] object-cover"
  aspectRatio="4/5"
  loading="lazy"
/>
```

This applies `width=240` thumbnails (sufficient for the 3-col grid) with `quality=60` compression via Supabase's on-the-fly transform, and wraps each image in the existing `ShimmerImage` component for a shimmer placeholder during load.

