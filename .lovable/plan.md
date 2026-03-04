

## Problem

The 6 pose images and 13 scene images were created as local placeholder binary files in `src/assets/` but the code references them via `getLandingAssetUrl()` which resolves to the `landing-assets` Supabase storage bucket. These images were never actually uploaded to the bucket, so they display as broken/low-quality placeholders.

## Solution: Generate and Upload High-Quality Previews

Create a new edge function that generates photorealistic preview images using `google/gemini-3-pro-image-preview` (the highest quality image model available) and uploads them directly to the `landing-assets` storage bucket where the code already expects them.

### 1. New Edge Function: `generate-asset-previews`

**File: `supabase/functions/generate-asset-previews/index.ts`**

- Accepts a list of asset paths and their generation prompts
- Uses `google/gemini-3-pro-image-preview` for maximum quality
- Uploads each generated image to the `landing-assets` bucket at the exact path the code expects (e.g., `poses/pose-lifestyle-gym.jpg`, `scenes/scene-shadow-play.jpg`)
- Processes in batches of 2-3 to avoid timeouts
- Returns progress so it can be called multiple times to complete all images

Prompts will be crafted for each image:
- **Pose images** (6): Full-body fashion model photography in specific settings (gym, shopping district, resort, gallery, autumn park, warehouse loft)
- **Scene images** (13): Product-only environment photography (shadow play, color backdrop, linen textile, terrazzo, brunch table, mid-century console, window sill, spa towels, glass shelf, tropical leaves, dried flowers, beach sand, stone path)

### 2. Admin trigger in the app

**File: `src/pages/Settings.tsx`** (or a temporary admin action)

Add a button (visible to admins only) that calls the edge function in batches until all 19 images are generated and uploaded. Shows progress as each batch completes.

### 3. Clean up local placeholders

Remove the 19 placeholder files from `src/assets/poses/` and `src/assets/scenes/` since they're not used by the code (code uses `getLandingAssetUrl` pointing to cloud storage).

### Files changed
- **New:** `supabase/functions/generate-asset-previews/index.ts` — edge function to generate and upload images
- **Edit:** `supabase/config.toml` — register the new function
- **Edit:** `src/pages/Settings.tsx` — add admin "Regenerate Previews" button
- **Delete:** 19 local placeholder files in `src/assets/poses/` and `src/assets/scenes/`

