## Goal
The public landing nav pill currently maxes at `lg:max-w-7xl` (1280px), so on wider screens it sits visibly narrower than the page content and looks "cropped." Widen the bar and re-balance the layout so logo, links, and CTA breathe naturally.

## Change
File: `src/components/landing/LandingNav.tsx`

- Header outer padding: `p-3 lg:px-6` (small extra side gutter on desktop so the bar doesn't kiss the viewport edges).
- Nav max-width: `lg:max-w-7xl` → **`lg:max-w-[1600px]`** (matches the wide content area used elsewhere on `/home` and `/ai-product-photography`, e.g. `max-w-[1400px]` content + page padding).
- Layout switch from a single `justify-between` row to a true 3-column flex on desktop:
  - Logo wrapper: `lg:flex-1` (takes the left third).
  - Links wrapper: kept centered with `justify-center` and gap bumped from `gap-8` → `gap-10 xl:gap-12` so links breathe in the wider bar.
  - CTA wrapper: `lg:flex-1 justify-end` (takes the right third, pushing the button to the far right).
- Mobile behavior unchanged. Mobile toggle gets `ml-auto` since the parent is no longer `justify-between`.
- Add `whitespace-nowrap` on link buttons (defensive, prevents wrapping if a future label is longer).

Result: the pill stretches to ~1600px on large screens, with logo flush left, the four links visually centered, and the "My Dashboard / Start Free" CTA flush right — natural balanced gaps on either side of the link cluster.

## Files touched
- `src/components/landing/LandingNav.tsx`