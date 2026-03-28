

# Fix Grey Line at Bottom of Library Image Cards

## Problem
Library cards show a thin grey line (gap) at the bottom of images. This happens because the `ShimmerImage` wrapper enforces a fixed CSS `aspectRatio` (e.g. `3/4`), but the `<img>` inside uses `w-full h-auto` — sizing to its natural dimensions. When the actual image aspect ratio doesn't exactly match the container's, a sliver of the muted background shows through at the bottom.

## Fix

### `src/components/app/LibraryImageCard.tsx`
Change the image className from:
```
w-full h-auto block
```
to:
```
w-full h-full object-cover block
```

This makes the image fill the entire aspect-ratio container and crop any slight mismatch, eliminating the grey line. This is consistent with how thumbnails work elsewhere in the app (RecentCreationsGallery already uses `w-full h-full object-cover`).

Single line change, one file.

