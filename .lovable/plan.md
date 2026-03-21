

# Improve TryShot Hero & Category Section

## Changes

### File: `src/pages/TryShot.tsx`

**1. Hero showcase — rotating images synced to typewriter word**

Replace the single static `showcaseBeauty` image with a rotating showcase that changes based on the current `wordIndex`. Map each rotating word to its corresponding category image:
- sneakers → showcaseSneakers
- skincare → showcaseSkincare  
- furniture → showcaseHome
- fashion → showcaseBeauty
- electronics → showcaseElectronics
- jewelry → showcaseJewelry

Add a crossfade transition (opacity) so the image smoothly swaps when the word changes. Stack two `<img>` elements absolutely positioned, toggling opacity.

**2. "Works with most products" — image cards with category labels**

Change from plain image grid to richer cards:
- Each card shows the category image with an overlay gradient
- Category label as a pill/chip badge at bottom-left (`bg-white/90 text-foreground text-xs font-medium px-3 py-1 rounded-full`)
- 2-col on mobile, 3-col on desktop (keep current grid)
- Slightly taller aspect ratio: `aspect-[3/4]` instead of `aspect-square` for better product visibility

**3. Minor spacing/polish fixes**
- Remove the `mb-10` gap between headline and showcase, reduce to `mb-6`
- Move subtitle closer to input: `mb-5` instead of `mb-8`
- "Free · No sign-up required" → smaller, lighter: `text-[11px] text-muted-foreground/50`
- Add `mt-1` to the free text so it tucks right under the input

## Summary
- 1 file modified
- Hero image rotates with the typewriter word (crossfade)
- Category grid gets pill-style labels on image cards
- Tighter spacing throughout hero section

