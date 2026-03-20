

# Fix: Workflow Thumbnails Zoomed In — Use `object-contain`

## Problem
The workflow preview thumbnails use `object-cover` which scales images to fill the `w-20 h-24` container, causing heavy zoom/crop on images that don't match the 5:6 aspect ratio. The user sees a zoomed-in portion instead of the full image.

## Change

### File: `src/components/app/CreativeDropWizard.tsx` (line 949)

Change the `ShimmerImage` className from `object-cover` to `object-contain`:

```tsx
// Before
<ShimmerImage src={...} className="w-full h-full object-cover" aspectRatio="5/6" />

// After
<ShimmerImage src={...} className="w-full h-full object-contain" aspectRatio="5/6" />
```

This shows the full image fitted inside the thumbnail without any cropping or zoom. The muted background fills any letterbox space.

## Summary
- 1 file, 1 line changed
- Thumbnails show the complete image instead of a zoomed-in crop

