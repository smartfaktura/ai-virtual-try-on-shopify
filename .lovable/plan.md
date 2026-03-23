

# Fix Product Images in Start Workflow Modal

## Problem
The previous fix changed product thumbnails from `object-cover` to `object-contain p-1`, which causes images to appear small/floating with excess whitespace inside the square container.

## Fix

### `src/components/app/StartWorkflowModal.tsx` (line 224)

Change from `object-contain p-1` to `object-cover` but with rounded corners for a clean look. The original `object-cover` was actually correct for this grid - the "zoomed in" issue was likely due to images with lots of whitespace around the product.

Better approach: use `object-contain` with slightly more padding and a subtle background to frame the product nicely:

```tsx
// Line 224: revert to object-cover which looks better in small grid thumbnails
className="w-full h-full object-cover"
```

`object-cover` is the standard for small thumbnail grids - it fills the square and looks consistent. The previous "zoom" issue was just how `object-cover` crops non-square images, which is actually the expected behavior for a compact product picker.

### File
- `src/components/app/StartWorkflowModal.tsx` - line 224, revert to `object-cover`

