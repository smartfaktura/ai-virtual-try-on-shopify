

# Redesign HomeHero — Real Rotating Images, Premium Typography, Better Layout

## Current State
The hero uses placeholder gradient cards with empty shapes — no real images, generic styling, text feels flat.

## Design Direction
Transform the hero into a premium, editorial-quality showcase with real product images rotating inside each card, refined typography, and a tighter asymmetric grid layout.

## Changes to `src/components/home/HomeHero.tsx`

### 1. Rotating Image Cards
Each output card (Product page, Social ad, Lifestyle) gets an array of 5 real images from `landing-assets/hero/` that cycle every 500ms with a crossfade transition. The Video card gets 3 short looping videos (`.mp4`) from storage with autoplay/muted/loop. Use `useState` + `useEffect` interval per card, staggered start times so they don't all flip in sync.

### 2. Center "Original" Card
Replace the faux silhouette with a real product image (e.g. `hero-product-croptop.jpg`) that also rotates between 3 product images (crop top, ring, headphones) every 2 seconds — slower cadence to anchor the composition.

### 3. Layout Improvements
- **Desktop**: Switch from the current cramped overlap to a clean asymmetric **bento-style grid** — center card large (`w-80 h-[28rem]`), four output cards arranged in a 2×2 grid around it with slight offset/rotation for depth, no overlap clipping
- **Mobile**: Stack into a 2×2 grid below the copy with the center "Original" card spanning full width above
- Remove the ambient blur glow (looks cheap) — replace with a subtle warm gradient on the section background

### 4. Premium Typography
- Headline: Increase to `text-5xl lg:text-6xl`, use `font-semibold` with tighter `tracking-[-0.03em]` and `leading-[1.05]` for editorial density
- Add a subtle warm gradient text effect on "Every visual" using `bg-clip-text text-transparent`
- Subtext: Slightly larger `text-[17px]`, warmer gray `text-[#64748b]`
- Tagline below buttons: Use `tracking-wide` spaced-out uppercase micro text
- No icons anywhere — purely typographic hierarchy

### 5. Button Styling
- Keep `rounded-full` pill style, increase primary CTA padding slightly
- Add subtle `shadow-lg shadow-[#1a1a2e]/15` on primary button for depth

### 6. Image Sources
Reuse existing landing-assets from the `hero/` folder (same images the main landing HeroSection uses). For videos, use assets from the `video-showcase/` folder if available, otherwise use 3 output images with a Ken Burns (slow zoom) animation to simulate motion.

## Files Modified
- `src/components/home/HomeHero.tsx` — full rewrite

## Technical Notes
- Image rotation uses a single `useEffect` with `setInterval(500)` updating an index per card
- Images are preloaded via `new Image().src` on mount to prevent flash
- Videos use `<video autoPlay muted loop playsInline>` with `poster` attribute
- All images loaded via `getLandingAssetUrl()` helper for correct storage URLs

