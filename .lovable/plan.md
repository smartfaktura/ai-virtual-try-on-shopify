

# Dynamic Auth Gallery from Storage

## What changes

Update `AuthHeroGallery` in `src/pages/Auth.tsx` to dynamically list all files in the `landing-assets` bucket under the `auth/` prefix, then shuffle and rotate through them — instead of using a hardcoded array.

## How it works

1. On mount, call `supabase.storage.from('landing-assets').list('auth')` to get all files
2. Build public URLs for each file using the storage base URL
3. Shuffle the array randomly
4. Use the existing crossfade rotation logic (every 5s) on the dynamic list
5. Keep a fallback to the current hardcoded images if the fetch fails or returns empty

| # | Action | Detail |
|---|--------|--------|
| 1 | Replace hardcoded `AUTH_GALLERY_IMAGES` array | Fetch file list from `landing-assets/auth/` on mount |
| 2 | Add shuffle utility | Randomize order each page load |
| 3 | Keep fallback | Use current images if bucket is empty or fetch fails |

**Your workflow after this:** Just upload images to `landing-assets → auth/` folder in Cloud Storage. They'll automatically appear in the rotating gallery on next page load. No code changes needed.

