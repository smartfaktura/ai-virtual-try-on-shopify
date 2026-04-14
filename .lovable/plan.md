

# Fix Short Film Picker Previews to Match /app/products

## Problem
The `/app/products` page uses `object-cover` for product thumbnails, which fills the square and looks good. The short-film picker dialogs use `object-contain`, which shows the full image but leaves huge empty space — causing the "stripe" effect for tall/narrow product photos.

## Fix

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

**Product picker** (line 408): Change `object-contain` to `object-cover` — matches `/app/products` exactly.

**Model picker** (line 338): Change `object-contain` to `object-cover` — models are portrait photos that look better filling the 3:4 frame.

Both changes are single-word CSS swaps. The background colors (`bg-white` for products, `bg-muted/30` for models) stay as-is since `object-cover` fills the container anyway.

| File | Change |
|------|--------|
| `ReferenceUploadPanel.tsx` | Line 408: `object-contain` → `object-cover` (products) |
| `ReferenceUploadPanel.tsx` | Line 338: `object-contain` → `object-cover` (models) |

