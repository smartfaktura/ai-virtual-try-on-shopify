

## Fix: Library Image Cards Loading Appearance

### Problem
Library image cards load progressively (top-to-bottom) instead of appearing smoothly. Although `ShimmerImage` is already used, the shimmer placeholder isn't visible because the card container lacks an explicit aspect ratio -- the shimmer collapses to zero height until the image loads.

### Solution
Apply the existing `getAspectClass` function (already defined but unused) to the card's outer container. This gives the card a fixed aspect ratio before the image loads, allowing the shimmer animation to display at the correct size. Once the image loads, it fills the container and fades in smoothly.

### Changes

**File: `src/components/app/LibraryImageCard.tsx`**

1. Add the aspect ratio class from `getAspectClass(item.aspectRatio)` to the outer card `div`. This ensures the card has the correct dimensions even before the image loads, making the shimmer visible.

```tsx
// Before:
<div className={cn(
  "group relative rounded-lg overflow-hidden cursor-pointer bg-muted transition-all",
  selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
)} ...>

// After:
<div className={cn(
  "group relative rounded-lg overflow-hidden cursor-pointer bg-muted transition-all",
  getAspectClass(item.aspectRatio),
  selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
)} ...>
```

This one-line change makes the shimmer animation visible at the correct card dimensions, and images fade in cleanly over 300ms instead of loading part by part.

### Files Modified
- `src/components/app/LibraryImageCard.tsx` -- apply aspect ratio class to card container

