

## Add Shimmer Loading to Library Detail Modal

### Problem
The Library detail modal (the split-panel popup shown when clicking a library image) uses a plain `<img>` tag, causing the image to load progressively (top-to-bottom) instead of appearing smoothly.

### Solution
Replace the plain `<img>` in `LibraryDetailModal` with the existing `ShimmerImage` component, matching the pattern already used in the lightbox and library cards.

### Changes

**File: `src/components/app/LibraryDetailModal.tsx`**

1. Import `ShimmerImage` from `@/components/ui/shimmer-image`.

2. Replace the `<img>` element (around line 97) with `ShimmerImage`:

```tsx
// Before:
<img
  src={item.imageUrl}
  alt={item.label}
  className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
/>

// After:
<ShimmerImage
  src={item.imageUrl}
  alt={item.label}
  className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
  wrapperClassName="flex items-center justify-center max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)]"
/>
```

The ShimmerImage component handles:
- Animated shimmer gradient placeholder while loading
- 300ms crossfade once the image is fully loaded
- No progressive top-to-bottom rendering

### Files Modified
- `src/components/app/LibraryDetailModal.tsx` -- replace `<img>` with `ShimmerImage`

