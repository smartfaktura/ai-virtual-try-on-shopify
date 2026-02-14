

## Fix White Bar Below Recent Creations Images

### Root Cause

In `ShimmerImage`, the wrapper `<div>` only applies `aspectRatio` style while loading. Once loaded, the style is removed, and the wrapper shrinks to the image's natural dimensions instead of filling the parent `aspect-[4/5]` container. This leaves a visible gap (white/gray bar) at the bottom of each card.

### Fix

**File: `src/components/ui/shimmer-image.tsx`**

Two changes:
1. Add `w-full h-full` to the wrapper div so it always fills its parent container
2. Keep the `aspectRatio` style as a fallback only when there is no parent constraint (standalone usage), but always allow the wrapper to stretch to fill available space

```typescript
// Before:
<div
  className={cn('relative overflow-hidden', wrapperClassName)}
  style={aspectRatio && !loaded ? { aspectRatio } : undefined}
>

// After:
<div
  className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}
  style={aspectRatio && !loaded ? { aspectRatio } : undefined}
>
```

This is a one-line change that fixes the white bar globally -- in Recent Creations, Library cards, Discover cards, and everywhere else `ShimmerImage` is used inside a sized parent container.

### Why This Works

The parent div in `RecentCreationsGallery` already sets `aspect-[4/5]` with `overflow-hidden`. Adding `w-full h-full` to the ShimmerImage wrapper makes it stretch to fill that parent. The `<img>` inside already has `w-full h-full object-cover`, so the image will cover the full card area with no gap.

