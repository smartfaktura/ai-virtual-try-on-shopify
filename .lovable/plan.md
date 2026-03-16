

## Fix missing scene name text in Freestyle scene selector

### Root cause
The `ShimmerImage` wrapper (line 45 of `shimmer-image.tsx`) has `className="relative overflow-hidden w-full h-full"`. The `h-full` causes the image wrapper to stretch and fill the entire parent button. Combined with the button's `overflow-hidden`, the text label div below the image gets pushed out of view and clipped.

### Fix

**File: `src/components/app/freestyle/SceneSelectorChip.tsx`** — Lines 184-190

Add `wrapperClassName` to override the `h-full` default, so the image wrapper only takes the space it needs and leaves room for the text label below:

```tsx
<ShimmerImage
  src={getOptimizedUrl(pose.previewUrl, { quality: 60 })}
  alt={pose.name}
  className="w-full aspect-[4/5] object-cover"
  wrapperClassName="h-auto"
  aspectRatio="4/5"
  loading="lazy"
/>
```

The single addition of `wrapperClassName="h-auto"` overrides the default `h-full` from `ShimmerImage`, allowing the text `div` below to remain visible within the `overflow-hidden` button.

