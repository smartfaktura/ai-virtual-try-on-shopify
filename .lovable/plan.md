

# /home Page: Use Homepage Nav + Bigger Visuals + Mobile Optimization

## Changes

### 1. Replace `HomeNav` with `LandingNav` in `Home.tsx`
- Remove `HomeNav` import, use `LandingNav` instead (the dark rounded pill navbar with auth-aware CTA)
- Adjust hero top padding to account for LandingNav's `p-3` + `h-14/h-16` offset

### 2. `HomeHero.tsx` — Bigger visuals, less clutter
- Make center card larger: `w-64 h-80 lg:w-72 lg:h-96`
- Make output cards larger: `w-36 h-44 lg:w-44 lg:h-56`
- Increase the visual area min-height: `min-h-[380px] lg:min-h-[520px]`
- On mobile: stack hero vertically, make visual area full-width and taller
- Use `rounded-full` CTA buttons to match LandingNav button style

### 3. `HomeTransformStrip.tsx` — Bigger cards, mobile scroll
- Increase card size: `w-48 h-64 sm:w-56 sm:h-72`
- On mobile: horizontal scroll (`overflow-x-auto flex-nowrap`) instead of wrapping, so cards don't squish
- Add `snap-x snap-mandatory` for smooth mobile scrolling

### 4. `HomeCreateCards.tsx` — Taller preview areas
- Increase preview height: `h-80 sm:h-96` (from `h-72 sm:h-80`)
- On mobile: single column, full-width cards
- Make inner faux product shapes bigger

### 5. `HomeCategoryExamples.tsx` — Bigger thumbnails
- Make category thumbnail grid `aspect-square` instead of `aspect-[3/4]`
- On mobile: 1 column instead of 2 columns (full-width cards)
- Increase inner shape sizes

### 6. `HomeHowItWorks.tsx` — Bigger step visuals
- Increase visual aspect ratio: `aspect-[4/3]` → `aspect-[3/2]` for more visual weight
- On mobile: visual comes first (before text), full-width
- Make inner UI mockup elements larger (icons, zones, cards)

### 7. `HomeOnBrand.tsx` — Bigger output grid
- Make output cards `aspect-square` instead of `aspect-[3/4]`
- Increase inner silhouette sizes
- On mobile: 2-column grid stays but cards are taller

### 8. `HomeQualityProof.tsx` — Bigger gallery items
- Increase `min-h-[200px]` → `min-h-[260px]`
- On mobile: single column, each card taller
- Larger inner product shapes

### 9. `HomeWhySwitch.tsx` — Mobile padding fix
- Single column on mobile (already `md:grid-cols-3`)
- Slightly more padding in cards on mobile

### 10. `HomePricingTeaser.tsx` + `HomeFinalCTA.tsx` — Match button styles
- Use `rounded-full` buttons to match LandingNav pill style
- Ensure full-width buttons on mobile

### 11. General mobile fixes across all sections
- Reduce section padding on mobile: `py-16 lg:py-32` instead of `py-24 lg:py-32`
- Ensure all text is readable (no text smaller than 13px on mobile)
- All grids collapse to single column on small screens where needed

## Files Modified
- `src/pages/Home.tsx` — swap nav
- `src/components/home/HomeHero.tsx`
- `src/components/home/HomeTransformStrip.tsx`
- `src/components/home/HomeCreateCards.tsx`
- `src/components/home/HomeCategoryExamples.tsx`
- `src/components/home/HomeHowItWorks.tsx`
- `src/components/home/HomeOnBrand.tsx`
- `src/components/home/HomeQualityProof.tsx`
- `src/components/home/HomeWhySwitch.tsx`
- `src/components/home/HomePricingTeaser.tsx`
- `src/components/home/HomeFinalCTA.tsx`

## File Deleted
- `src/components/home/HomeNav.tsx` — no longer needed

