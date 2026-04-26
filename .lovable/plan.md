## Two Fixes for Homepage

### 1. Remove redundant "VOVV.AI" repetition in final CTA section
The bottom "Get started" block (`src/components/home/HomeFinalCTA.tsx`) currently says:
- H2: "Start creating with **VOVV.AI**"
- Body: "Upload one product photo. See what **VOVV.AI** creates for your brand."

Plus the brand is already all over the page. **Fix:** rewrite to drop the repetition.
- H2: "Start creating today"
- Body: "Upload one product photo. See what we create for your brand."

### 2. Mobile hero: stop the second-line jumping
The user wants a clean, fixed two-line layout:
- Line 1: "AI Product Visuals." (always 1 line)
- Line 2: typewriter phrase (always 1 line, never wraps, no height jumping)

**Root cause:** On mobile (~360–390px wide), the longest typewriter phrase ("Every Scene. Every Angle.") wraps to 2 lines at the current 2rem font, so the headline jumps from 2 → 3 lines mid-animation.

**Fix in `src/components/home/HomeHero.tsx`:**
1. Revert the responsive `<br>` — always keep the `<br>` so the structure is always 2 lines.
2. Make the typewriter line slightly smaller on mobile so the longest phrase fits on one line, and force `whitespace-nowrap` always:
   - Wrap the `<HeroTypewriter />` in a span with mobile-only smaller sizing: `text-[1.5rem] sm:text-inherit`
   - In `HeroTypewriter`'s span, change `inline-block sm:whitespace-nowrap min-h-[2.3em] sm:min-h-[1.15em]` → `inline-block whitespace-nowrap min-h-[1.15em]` (one-line height locked on all viewports).

Result: hero is always exactly 2 lines on mobile with consistent height — no jumping, even spacing.

### Files
- `src/components/home/HomeFinalCTA.tsx`
- `src/components/home/HomeHero.tsx`
