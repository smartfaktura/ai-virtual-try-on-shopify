

## Improve Mobile Hero Carousel Arrow UX

### Problem
The current arrows are tiny (28px), sit on top of image content, and feel fiddly on mobile touchscreens. They lack active/disabled states and don't indicate scroll position.

### Solution — Mobile-optimized carousel navigation

**1. Bigger touch targets with better positioning**
- Increase arrow buttons from `w-7 h-7` to `w-9 h-9` (36px) — meets 44px touch target with padding
- Add `active:scale-90` for tactile press feedback
- Hide left arrow when scrolled to start, hide right arrow when scrolled to end (use the existing `scrollState`)
- Add `transition-opacity` so arrows fade in/out smoothly

**2. Add dot indicators below the carousel**
- Small dots row showing approximate scroll position (one dot per ~2 cards)
- Active dot highlighted with `bg-primary`, others `bg-muted-foreground/30`
- Provides visual context of how many images are available

**3. Edge gradient overlays**
- Add subtle gradient fade on left/right edges of the scroll strip to hint at more content
- Left gradient: `bg-gradient-to-r from-background to-transparent`
- Right gradient: `bg-gradient-to-l from-background to-transparent`
- Only show when there's content to scroll in that direction

### Changes — `src/components/landing/HeroSection.tsx` (lines 252-303)

- Arrow buttons: `w-9 h-9`, `active:scale-90 transition-all`, conditionally render based on scroll position
- Add `activeIndex` state derived from scroll position for dot indicators
- Add gradient overlays as `absolute` pseudo-elements on the scroll container edges
- Add a dot row `div` with `flex gap-1.5 justify-center` below the scroll strip

