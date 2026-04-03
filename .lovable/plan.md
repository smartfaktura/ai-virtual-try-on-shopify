

# Fix Onboarding Hero Image Gallery

## Problem
The Onboarding page uses a single hardcoded image URL (`auth/auth-hero.jpg`) in a plain `<img>` tag. If that image fails to load, the right panel shows a broken image icon — which is what the screenshot shows. Meanwhile, the Auth page has a robust `AuthHeroGallery` component that loads images dynamically from storage with fallbacks and a rotating slideshow.

## Solution
Extract the `AuthHeroGallery` component from `Auth.tsx` into a shared file, then use it in both Auth and Onboarding pages.

## Files to Create

### `src/components/app/AuthHeroGallery.tsx`
Extract the existing `AuthHeroGallery` component (lines 17-97 of Auth.tsx) along with its `FALLBACK_GALLERY_IMAGES`, `shuffleArray` helper, and all the logic (storage bucket fetch, slideshow timer, preloading). Make it a named export.

## Files to Modify

### `src/pages/Auth.tsx`
- Remove the inline `AuthHeroGallery` component, `FALLBACK_GALLERY_IMAGES`, and `shuffleArray`
- Import `AuthHeroGallery` from `@/components/app/AuthHeroGallery`

### `src/pages/Onboarding.tsx`
- Remove the `authHero` constant (line 16)
- Import `AuthHeroGallery` from `@/components/app/AuthHeroGallery`
- Replace the plain `<img>` right-side panel (the `<div className="hidden lg:block ...">` block) with `<AuthHeroGallery />`

