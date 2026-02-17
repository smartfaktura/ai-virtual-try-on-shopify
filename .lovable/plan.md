

## Fix Recent Jobs Thumbnail — Revert to object-cover

### Problem
The previous fix changed thumbnails from `object-cover` to `object-contain`. For portrait-ratio images (taller than wide), `object-contain` shrinks the entire image to fit, resulting in a thin vertical line inside the 10x10 square container.

### Solution
Revert the image class back to `object-cover`. This center-crops the image to perfectly fill the square container, which is the correct behavior for small thumbnail previews in a table.

- `object-cover` = fills the box, crops overflow (correct for thumbnails)
- `object-contain` = fits entire image, leaves empty space (wrong for thumbnails)

### Technical Detail

| File | Line | Change |
|---|---|---|
| `src/pages/Dashboard.tsx` | 341 | Change `object-contain` back to `object-cover` |

