

# Improve Batch Mode UX with Free/Paid Gating

## Changes

### 1. Remove "Works across ecommerce categories" chips section
Delete lines 517-534 from `AnimateVideo.tsx` — the category chips row that clutters the pre-upload screen.

### 2. Redesign Batch Mode toggle with free/paid messaging
Replace the current simple toggle with a more prominent card that:
- **Paid users**: Shows toggle as-is with "Animate up to 10 images" messaging
- **Free users**: Shows a locked/disabled state with avatar-branded message like "Upgrade to any paid plan to animate multiple images at once" with a VOVV avatar (e.g., Sophia). The toggle is disabled.

### 3. Unify upload area for both single and batch modes
Currently: Single mode shows a big drop zone, batch mode shows the `BulkImageGrid` only after upload in the post-analysis section (lines 1017-1027).

**New approach**: The pre-upload screen always shows the same upload card, but:
- **Single mode (free)**: Upload zone accepts 1 image, buttons say "Upload image"
- **Batch mode (paid)**: Upload zone accepts multiple, text says "Upload images (up to 10)", and the `BulkImageGrid` is shown directly inside the upload card once images start being added (not hidden below the settings section)

Move the `BulkImageGrid` from the post-analysis section (line 1017) into the upload card area so users see their batch building in real-time, matching the screenshot where images appear in the grid alongside the Upload/Library buttons.

### 4. Show BulkImageGrid in pre-upload screen when batch mode is on
When `bulkMode` is true and `bulkImages.length > 0`, show the grid in the upload card area instead of the empty drop zone. Keep the Upload/Library buttons visible below the grid.

### 5. Post-upload: show batch grid instead of single image preview
In the post-upload form section (line 686+), when in batch mode, replace the single image preview (lines 689-704) with the `BulkImageGrid` component, so users always see and can manage their batch.

## Files to modify
- **`src/pages/video/AnimateVideo.tsx`** — Remove category chips, redesign batch toggle with free/paid UX and avatars, move BulkImageGrid to upload area, unify upload experience

