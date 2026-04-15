

# Fix Library Bulk Download (ZIP only gets 1 file)

## Root Cause
The bulk download fetches each image via `fetch(item.imageUrl)` directly in the browser. Many of these URLs are external provider URLs (from AI generation services) that block cross-origin requests (CORS). The `catch` block silently skips failed fetches, so only 1 image ends up in the ZIP.

## Solution
Route all image fetches through Supabase Storage's download proxy. For external URLs, use the existing `?download=` parameter pattern or fetch via a proxy edge function. The simplest fix is to reuse the `downloadDropAsZip` utility from `src/lib/dropDownload.ts` (which has the same CORS issue) and instead proxy all downloads through a small edge function that fetches on the server side and returns the blob.

**However**, the simpler and more robust approach: use the **Supabase Storage render endpoint** as a CORS-friendly proxy. Since `getOptimizedUrl` already converts URLs to Supabase render URLs, we can use those for the fetch — they have proper CORS headers.

### Changes

1. **`src/pages/Jobs.tsx`** — Update `handleBulkDownload` to:
   - Use `getOptimizedUrl(item.imageUrl, { quality: 100 })` for each image URL to route through Supabase's render endpoint (which has CORS headers)
   - If that still has CORS issues, fall back to creating a temporary edge function `proxy-image-download` that fetches the URL server-side
   - Add a toast for progress feedback (e.g., "Downloading 3/8…")
   - Add error handling that reports how many images failed

2. **Alternative if render proxy doesn't work**: Create an edge function `proxy-image-download` that accepts a URL, fetches it server-side, and returns the blob — bypassing CORS entirely.

## Technical Detail
The render endpoint pattern: `{SUPABASE_URL}/storage/v1/render/image/public/{bucket}/{path}` only works for Supabase-hosted images. For external provider URLs, we need the edge function approach.

**Recommended approach**: Create a lightweight `image-proxy` edge function that accepts a URL parameter, fetches the image server-side, and streams it back. Then update `handleBulkDownload` to route all fetches through this proxy.

