## Goal
Make the `/product-visual-library` hero match the centered, premium spacing used on `/home` and `/ai-product-photography` (currently it's slim and left-aligned, which feels off-brand).

## Change
File: `src/pages/ProductVisualLibrary.tsx` (lines 98–109)

Replace the slim left-aligned hero with a centered hero block:

- Container: `max-w-3xl mx-auto px-6 text-center` (matches homepage hero centering).
- Top padding bumped from `pt-10 sm:pt-14` → `pt-24 sm:pt-28 lg:pt-32` so it clears the fixed nav with breathing room.
- Bottom padding `pb-12 sm:pb-16 lg:pb-20`.
- Add the eyebrow used across the brand: small uppercase wide-tracking label *"Scene library"*.
- H1 styling matches other landing heroes: `text-[2.5rem] sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6` — keeps copy "AI Product Visual Library".
- Subtitle centered under the H1 with `max-w-xl mx-auto text-muted-foreground text-lg leading-relaxed`. Copy unchanged.

Catalog section below remains untouched.

## Files touched
- `src/pages/ProductVisualLibrary.tsx`