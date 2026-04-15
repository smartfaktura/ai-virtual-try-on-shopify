

# Fix Single Image Download (CORS failure)

## Root Cause
Same CORS issue as the bulk download. `saveOrShareImage()` in `src/lib/mobileImageSave.ts` and `downloadImage()` in `LibraryImageCard.tsx` both do a direct browser `fetch(imageUrl)` which fails on external provider URLs.

## Solution
Route all image fetches through the already-deployed `image-proxy` edge function.

### Changes

1. **`src/lib/mobileImageSave.ts`** — Update `saveOrShareImage` to proxy the fetch through `image-proxy`:
   - Build proxy URL: `${VITE_SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(imageUrl)}`
   - Keep all existing mobile share sheet and fallback logic unchanged

2. **`src/components/app/LibraryImageCard.tsx`** — Update `downloadImage` function to use the same proxy URL pattern

Both are small one-line URL changes. The `image-proxy` edge function is already deployed and working.

