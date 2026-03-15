

## Replace "Bright Countertop" Scene Preview Image

The current scene preview for "Bright Countertop" uses `showcase/food-bread-bakery.jpg` from the `landing-assets` storage bucket. The user wants to replace it with the new bread photo they uploaded (`freestyle-1_30.png`).

### Steps

1. **Upload the new image to storage** — Copy `user-uploads://freestyle-1_30.png` to `public/images/scenes/bright-countertop.jpg` temporarily, then upload it to the `landing-assets` bucket at path `showcase/food-bread-bakery.jpg` (replacing the existing file). Since the asset path stays the same, no code changes are needed in `mockData.ts`.

   Actually, since landing assets are served from Supabase Storage and referenced by path via `getLandingAssetUrl`, the simplest approach is:
   - Copy the uploaded image into the project
   - Upload/replace it in the `landing-assets` bucket at the same path (`showcase/food-bread-bakery.jpg`) so the existing reference works automatically
   - The image will be served with `quality=70` optimization via the existing `getOptimizedUrl` pipeline

2. **Alternative if bucket upload isn't straightforward** — Copy to `public/images/scenes/bright-countertop.jpg` and update the `previewUrl` in `mockData.ts` line 1364 to point to the local path instead. But the storage approach is cleaner and consistent with the existing asset workflow.

### Technical Details
- The image is a `.png` (1024x1024 approx). It will be optimized via Supabase Storage's `quality` parameter at render time.
- No code changes needed if the storage path stays the same. Only need to replace the file in the bucket.
- The `ShimmerImage` component and `getOptimizedUrl` pipeline handle display optimization automatically.

