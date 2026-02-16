

## Fix Recent Jobs Thumbnails: Show Original Aspect Ratio

### Problem

The Recent Jobs table thumbnails are rendered in a fixed `w-10 h-10` (40x40px) square container with `object-cover`. This crops and zooms into images that aren't square (e.g., portrait 3:4 product photos, landscape flat lay shots), making them look zoomed-in and losing important visual context.

### Solution

Change the thumbnail container from a fixed square to a fixed-height rectangle that uses `object-contain` instead of `object-cover`. This preserves the original aspect ratio of each image without cropping.

### Technical Details

**File: `src/pages/Dashboard.tsx`** (lines 337-343)

Change the thumbnail container and image styling:
- Container: from `w-10 h-10` to `w-12 h-10` (slightly wider to accommodate landscape images)
- Image: from `object-cover` to `object-contain` so images are fully visible without cropping
- Add a subtle `bg-muted/30` background so the letterbox area blends in

This ensures portrait, square, and landscape product images all render at their natural proportions within the table row.
