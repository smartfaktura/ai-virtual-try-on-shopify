

# Rotating Gallery on Auth Page Right Side

## What changes

Replace the single static hero image on the right side of `/auth` with a rotating gallery that crossfades between multiple product images from your storage bucket.

## How it works

**File: `src/pages/Auth.tsx`**

1. Define an array of image URLs (from `landing-assets` storage) — you can upload your own images to that bucket and add them to the array
2. Add a `useState` for the current index and a `useEffect` with a `setInterval` (every 5 seconds) to cycle through images
3. Render two `<img>` layers with CSS `opacity` + `transition-opacity duration-1000` for a smooth crossfade
4. Keep the existing gradient overlay and "Generated with VOVV.AI" caption

**Implementation detail:**
- Preload the next image in the sequence to avoid flash-of-loading
- Use `absolute inset-0` positioning on both image layers with `transition-opacity duration-1000 ease-in-out`
- Current image gets `opacity-100`, previous gets `opacity-0`

| # | Action | File |
|---|--------|------|
| 1 | Replace single `<img>` with rotating gallery component | `src/pages/Auth.tsx` (lines 590-603) |

## Your images

You mentioned you have pictures to use. After implementation, you can either:
- Upload them to your `landing-assets` storage bucket under `auth/` and add the paths to the array
- Or share them here and I'll add them directly to the code

