

## Add Primary Image Selection to URL Import

When multiple images are extracted from a product URL, let the user click a thumbnail to choose which image becomes the primary product image (`image_url` on the product record).

### Changes: `src/components/app/StoreImportTab.tsx`

1. **Add `selectedImageIndex` state** — defaults to `0` (first image)
2. **Make thumbnails clickable** — clicking a thumbnail sets `selectedImageIndex`; show a ring/check on the selected one
3. **Update the large preview image** — bind the 80x80 preview to `extracted.image_urls[selectedImageIndex]`
4. **Update `handleSave`** — use `extracted.image_urls[selectedImageIndex]` as the product's `image_url` and reorder `position` values so the selected image is position 0

### UI Behavior
- Thumbnails get a blue ring + small checkmark overlay when selected
- Clicking any thumbnail instantly updates the large preview
- Default selection remains the first image (no change for single-image imports)

