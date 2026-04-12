

# Admin Bulk Preview Upload Page

## What
A new admin page at `/app/admin/bulk-preview-upload` where you can drag-drop multiple scene preview images at once. The tool auto-matches filenames to existing `product_image_scenes` by scene title/scene_id, shows matches for confirmation, then bulk-updates `preview_image_url` for all matched scenes.

## How it works

1. **Select category** — dropdown to pick a `category_collection` (e.g., "fragrance") to scope matching
2. **Drop zone** — drag-drop or select multiple images at once
3. **Auto-match** — for each uploaded file, fuzzy-match the filename against scene titles and scene_ids in the selected category:
   - `Aquatic_Reflection_28.jpg` → matches scene `aquatic-reflection` (title: "Aquatic Reflection")
   - Matching logic: normalize filename (strip prefix like `Maison_Aurelienne_Noir_Velours_Perfume_`, strip trailing `_N` number, replace `_` with spaces/hyphens) and compare against scene title (case-insensitive) and scene_id
4. **Review grid** — show each image with its matched scene (thumbnail + title), highlight unmatched files in red
5. **Confirm & upload** — one button uploads all images to `product-uploads` bucket and bulk-updates `preview_image_url` for each matched scene
6. **Progress indicator** — shows upload progress (X/N complete)

## Files

### New: `src/pages/AdminBulkPreviewUpload.tsx`
- Admin-only page with category selector, multi-file drop zone
- Fuzzy filename-to-scene matcher
- Grid showing matched pairs with ability to manually reassign or skip
- Bulk upload + DB update on confirm
- Uses `useProductImageScenes` hook for scene data, `useFileUpload` pattern for storage uploads, `updateScene` mutation to save `preview_image_url`

### Modified: `src/App.tsx`
- Add lazy import and route: `/app/admin/bulk-preview-upload`

### Modified: `src/pages/AdminProductImageScenes.tsx`
- Add a link/button in the header area pointing to the new bulk upload page (e.g., "Bulk Previews" button next to existing actions)

## Matching algorithm

```text
filename: "Maison_Aurelienne_Noir_Velours_Perfume_Aquatic_Reflection_28.jpg"
  → strip extension → split on "_" → try progressively shorter suffixes
  → "Aquatic Reflection" matches scene title "Aquatic Reflection" ✓
  → also try slug: "aquatic-reflection" matches scene_id ✓
```

Uses longest-match-from-end strategy so brand prefixes are automatically ignored. No configuration needed.

