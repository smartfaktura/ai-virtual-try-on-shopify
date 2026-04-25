# Fix: Dark sections on feature pages blend together

## The problem

All five feature pages (Virtual Try-On, Brand Profiles, Image Upscaling, Perspectives, Real Estate Staging) end with two dark sections stacked back-to-back:

1. `WhyVovvSection` — `bg-[#1a1a2e]`
2. `FinalCtaDark` — `bg-[#1a1a2e]`

Both use the **identical** background color and live as shared components in `src/pages/features/PerspectivesFeature.tsx` (imported by the other four). With no separation, they read as one giant dark slab — exactly what's visible in the screenshot.

## The fix (one file: `src/pages/features/PerspectivesFeature.tsx`)

Differentiate the two dark panels so the eye sees two distinct sections — without breaking the dark-on-dark editorial flow:

1. **`WhyVovvSection`** — change background from `#1a1a2e` → **`#22223a`** (a touch lighter, still on-brand). Soften the inner card surface from `bg-white/5` → `bg-white/[0.04]` so cards stay readable on the lighter backdrop.
2. **`FinalCtaDark`** — keep the deeper `#1a1a2e` (it stays the closer of the two and frames the page footer). The lighter Why-VOVV panel above + the deeper CTA below now reads as a clear two-step transition instead of one merged block.
3. Tighten Why VOVV vertical padding `py-16 lg:py-32` → `py-16 lg:py-28` so the two panels feel like a connected pair rather than two oversized slabs.

No copy changes, no structural changes, no per-page edits — the fix propagates to all five pages because both sections are shared components.

## Out of scope

- No changes to the cream sections, hero, FAQ, or shared cards
- No new components or files
- No changes to the home page CTA pattern (which sits alone over a cream page, so it doesn't have this issue)
