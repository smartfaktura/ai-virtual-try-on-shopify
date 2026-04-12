

# Fix Scene Card Checkmark Visibility

## Problem
The checkmark on selected scene cards uses `text-primary fill-primary/20` which is dark and nearly invisible against dark preview images.

## Solution
Replace the `CheckCircle` icon with a solid primary-colored circle containing a white check icon.

## File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

### Lines 197-201 — replace the checkmark rendering:

**From:**
```tsx
{selected && (
  <div className="absolute top-1.5 right-1.5">
    <CheckCircle className="w-5 h-5 text-primary fill-primary/20 drop-shadow-sm" />
  </div>
)}
```

**To:**
```tsx
{selected && (
  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
    <Check className="w-3.5 h-3.5 text-white" />
  </div>
)}
```

- Solid `bg-primary` circle with `shadow-md` for contrast against any image
- White `Check` icon inside (already imported from lucide-react)
- Slightly larger (w-6 h-6) for better tap target and visibility

Also update the import: replace `CheckCircle` with `Check` if `CheckCircle` is no longer used elsewhere in the file (or just add `Check` to existing imports).

