

## Fix Recent Jobs Thumbnails

### Problem

The thumbnails appear as tiny vertical slivers. The recent change to `object-contain` backfired for portrait images — fitting a tall image into a 48x40px box makes it paper-thin. Thumbnails need cropping to look good at small sizes.

### Solution

**File: `src/pages/Dashboard.tsx`** (line 337-342)

Switch back to `object-cover` (the standard for thumbnails) but make the container a proper square so the crop looks natural:

- Container: change from `w-12 h-10` to `w-10 h-10` (square, 40x40px)
- Image: change from `object-contain` back to `object-cover`
- Keep `rounded-md`, `bg-muted/30`, and `border`

`object-cover` is the correct choice for small thumbnails — it center-crops the image to fill the container, giving a clean preview regardless of the source aspect ratio. `object-contain` only works well when the container is large enough to show the image meaningfully.

