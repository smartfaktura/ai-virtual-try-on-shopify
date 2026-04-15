

# Adapt Landing Page Freestyle Animation for Workflows Card

## Idea

Replace the current simple `FreestylePromptCard` (static typing + grey background) with a compact version of the landing page's `FreestyleShowcaseSection` animation — the full prompt typing → chip activation → generate button pulse → result images appearing cycle — all fitted into the same card dimensions as the other workflow cards.

## Approach

### File: `src/components/app/FreestylePromptCard.tsx` — full rewrite

**Keep**: Same `Card` wrapper, same `onSelect` prop, same `mobileCompact` prop, same bottom content area (title + CTA button).

**Replace visual area** with a miniaturized version of the landing animation:

1. **Typing animation** — reuse the same prompt text, typed at same speed
2. **Chips row** — Product, Model, Scene chips that activate with delays (scaled down to fit card)
3. **Mini generate button** — pulses with spinner during "generating" phase
4. **Progress bar** — thin 2px bar at top of the visual area
5. **Result images** — 3 small result thumbnails that fade in, using the same `RESULT_CARDS` images from the landing section
6. **Auto-cycle** — loops every ~6-7 seconds (shorter than landing's 8s since it's smaller)

**Sizing**: The visual area stays at `aspect-[3/4]` (or `aspect-[2/3]` on mobile compact). Everything is scaled down — `text-[9px]` chips, tiny 14px avatar circles, compact prompt box.

**Reuse assets**: Import the same optimized URLs from `landingAssets` (`showcase/source-crop-top.jpg`, model avatars, result cards). No new images needed.

**No external section chrome**: Strip the `<section>`, header text, and CTA button from the landing version — only the demo panel content goes inside the card's visual area.

## Impact
- 1 file changed (`FreestylePromptCard.tsx`)
- Reuses existing optimized image assets from landing page
- Much more engaging than current static typing-only card
- Matches the premium animated feel users already see on the homepage

