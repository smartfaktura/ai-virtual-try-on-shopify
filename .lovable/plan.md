

## Fix Overlapping Product Thumbnails in TryOnPreview

The `MultiProductThumbs` component uses `-space-x-3` which causes thumbnails to overlap. Replace with a clean side-by-side layout with proper spacing.

### Change in `src/components/app/TryOnPreview.tsx`

**`MultiProductThumbs` (lines 66-97)**: Replace the overlapping `-space-x-3` layout with a normal `gap-2` flex row. Show up to 3 thumbnails at a smaller size (w-12 h-12 / sm:w-16 sm:h-16) so they fit without overlapping, with a "+N" badge and count label.

- Remove `flex -space-x-3` → use `flex gap-1.5`
- Slightly reduce thumbnail sizes so multiple fit cleanly
- Keep the border styling but use `border-background` (white ring effect) to give each thumbnail a clean separated look

