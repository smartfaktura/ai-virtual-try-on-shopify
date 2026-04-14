

# Fix: Image Download Failing

## Problem
The "Download Image" button in the Library Detail Modal fails with "Download failed" toast. The `saveOrShareImage()` function uses `fetch(imageUrl)` to download the image blob, but this fails due to CORS restrictions on signed storage URLs or external CDN URLs. The browser blocks the cross-origin fetch, the catch block fires, and the user sees the error.

## Solution
Add CORS error handling with a fallback strategy: when `fetch()` fails, fall back to opening the image in a new tab (or using an anchor tag with the URL directly). Also add `mode: 'cors'` explicitly and handle the error gracefully.

### `src/lib/mobileImageSave.ts`

1. **Try fetch first** (current behavior) -- works for same-origin and CORS-enabled URLs
2. **On fetch failure, use fallback**: open a new `window.open(imageUrl, '_blank')` so the user can right-click save, OR use an `<a>` tag with `target="_blank"` to trigger browser-native download
3. **Better approach**: Route the download through a proxy edge function OR use Supabase's `download()` method for storage URLs

The cleanest fix: detect if the URL is a Supabase storage signed URL, and if so, append `&download=` query param (Supabase storage supports this natively). For external URLs, use a simple `window.open` fallback.

### Changes

**`src/lib/mobileImageSave.ts`**:
- Wrap fetch in try/catch separately from the rest
- If fetch fails (CORS), fall back to `window.open(imageUrl, '_blank')` with a toast explaining to right-click save
- For Supabase storage URLs: detect them and use the `?download=` query parameter which forces a download header
- Remove silent failure -- show actionable feedback

### Files changed
- `src/lib/mobileImageSave.ts` -- add CORS fallback download strategy

