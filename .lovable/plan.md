

# Fix Landing Page Lag and Missing Sections

## Problems Found

1. **Missing sections**: All below-fold sections share a single `<Suspense fallback={null}>` boundary. If any chunk loads slowly, all sections show nothing until every chunk resolves. The screenshot shows the footer loaded but middle sections are blank.

2. **Three concurrent `requestAnimationFrame` loops** run continuously regardless of scroll position:
   - `StudioTeamSection` (auto-scroll carousel)
   - `EnvironmentShowcaseSection` MarqueeRow x2 (JS-driven marquees)
   
   These consume CPU even when off-screen.

3. **`backdrop-blur-sm` over animated content** in `ProductCategoryShowcase` (category labels, line 46) and `HeroSection` (upload badge, line 416; mobile labels, line 319). Each blur re-samples underlying pixels every frame during image crossfades.

4. **Environment marquee uses JS rAF** while the identical Model marquee uses CSS `animation` (GPU-accelerated). The environment section should match the model section's approach.

5. **4 independent `setInterval` timers** in `CategoryCard` cycling images at 6-8s, each triggering React re-renders with opacity transitions.

## Plan

### 1. Split Suspense boundaries (Landing.tsx)
Wrap each lazy section in its own `<Suspense fallback={null}>` so they render independently as their chunks arrive, preventing one slow chunk from blocking all sections.

### 2. Replace `backdrop-blur-sm` with `text-shadow` (3 files)
- **ProductCategoryShowcase.tsx** line 46: Remove `backdrop-blur-sm` from category label, use `text-shadow` for readability over cycling images
- **HeroSection.tsx** line 416: Remove `backdrop-blur-sm` from "Your Upload" badge
- **HeroSection.tsx** line 319: Remove `backdrop-blur-sm` from mobile output labels

### 3. Convert EnvironmentShowcaseSection marquee from JS rAF to CSS animation
Replace the `useEffect` + `requestAnimationFrame` loop with a CSS `@keyframes marquee-left/right` animation (matching `ModelShowcaseSection`'s pattern). This moves work to the compositor thread and eliminates 2 rAF loops.

### 4. Add IntersectionObserver pause to StudioTeamSection auto-scroll
Only run the rAF auto-scroll loop when the section is visible in the viewport. When off-screen, pause the animation to free CPU.

### 5. Use CSS transitions instead of interval-driven React state for CategoryCard image cycling
Replace the `setInterval` + `useState` cycling with CSS-only `animation-delay` staggered opacity keyframes, removing 4 timers and their React re-renders.

## Files Changed
- `src/pages/Landing.tsx` — split Suspense boundaries
- `src/components/landing/ProductCategoryShowcase.tsx` — remove backdrop-blur, optimize timers
- `src/components/landing/HeroSection.tsx` — remove backdrop-blur
- `src/components/landing/EnvironmentShowcaseSection.tsx` — CSS animation instead of rAF
- `src/components/landing/StudioTeamSection.tsx` — visibility-gated rAF

