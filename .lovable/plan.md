# Swap /auth hero gallery images

Replace the rotating images on the `/auth` page with the 10 curated URLs the user provided.

## Changes
- `src/components/app/AuthHeroGallery.tsx`
  - Replace `FALLBACK_GALLERY_IMAGES` with the 10 provided Supabase URLs (wrapped in `getOptimizedUrl(..., { quality: 60 })`).
  - Remove the `loadImages()` effect that lists the `landing-assets/auth` storage folder, so the curated set is the only source.
  - Keep the existing shuffle, 5s crossfade rotation, and next-image preload behavior.

## Out of scope
- No changes to layout, copy, gradient, or the "Generated with VOVV.AI" caption.
- No DB or storage changes.
