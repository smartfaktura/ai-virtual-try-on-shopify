

# Add Preview Image Override for Scenes

## What
Allow admins to set a separate "display preview" image for scenes that is different from the backend reference image (`image_url`). This preview image is what users see in the UI, while the original `image_url` continues to be used for generation.

## Database Change
Add a `preview_image_url` column to the `custom_scenes` table:
- Nullable text column, defaults to `NULL`
- When `NULL`, the existing `image_url` is used as preview (backward compatible)
- When set, this URL is shown to users instead

## Files to Modify

### 1. Migration: Add `preview_image_url` column
```sql
ALTER TABLE public.custom_scenes ADD COLUMN preview_image_url text DEFAULT NULL;
```

### 2. `src/hooks/useCustomScenes.ts`
- Add `preview_image_url` to `CustomScene` interface
- In `toTryOnPose()`: use `scene.preview_image_url || scene.image_url` for `previewUrl`
- In `useUpdateCustomScene`: allow `preview_image_url` in the update params

### 3. `src/pages/AdminScenes.tsx` — SceneRow component
- For custom scenes, add an "Upload Preview" button (small camera/image icon) next to the thumbnail
- Clicking opens a file picker → uploads to `product-uploads` bucket → saves `preview_image_url` via `useUpdateCustomScene`
- Show a small indicator badge when a custom preview is set (e.g., "Custom Preview")
- Add a "Reset Preview" option to revert to the original `image_url`

### 4. Generation logic stays untouched
- `supabase/functions/generate-catalog/index.ts` already uses `image_url` for references — no changes needed there

## How It Works
- Admin goes to `/app/admin/scenes`
- On any custom scene row, clicks the camera icon on the thumbnail
- Picks an image file → uploads → `preview_image_url` is saved
- Users now see the new preview; generation still uses the original `image_url`
- Admin can reset to remove the override

