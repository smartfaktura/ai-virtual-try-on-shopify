

## Fix: Product Generations Not Showing in Recent Creations

### Root Cause

The `generate-product` edge function returns base64 data URLs from the AI gateway and saves them directly into the `generation_jobs.results` column without uploading to storage first. The dashboard's Recent Creations gallery intentionally filters out base64 URLs (they're massive strings that hurt performance), so these results never appear.

Meanwhile, `generate-tryon` correctly uploads base64 images to the `tryon-images` storage bucket before saving -- which is why try-on results show up fine.

### Fix

**File: `supabase/functions/generate-product/index.ts`**

Add a `uploadBase64ToStorage` helper (same pattern used in `generate-tryon`) that:
1. Decodes the base64 data URL
2. Uploads the image to a storage bucket (we'll use the existing `workflow-previews` bucket or create a `product-images` bucket)
3. Returns the public URL

Then, after each image is generated, upload it to storage before pushing to the `images` array. This way, `results` will contain proper storage URLs instead of giant base64 strings.

Changes:
- Add `uploadBase64ToStorage()` function (same as in generate-tryon)
- Add Supabase client initialization for storage access
- After `generateImage()` returns a base64 URL, upload it to storage and use the public URL
- No frontend changes needed -- the dashboard already handles storage URLs correctly

### Why This Also Fixes the Library

The Library currently renders base64 images directly, which works but is extremely slow (each image is ~12MB of text in the JSON column). After this fix, Library performance will improve too since it'll load from CDN-served storage URLs.

