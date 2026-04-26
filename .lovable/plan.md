## Problem

On mobile, the homepage models marquee runs the full-width animation off-screen. Tiles spend most of their cycle outside the viewport, which:

- Makes the section feel empty/broken (only 2-3 visible at a time, then long gaps)
- Causes lazy-loaded images in the second row to never trigger loading
- Wastes the marquee's purpose — users barely see the variety of models

## Root cause

In `src/components/landing/ModelShowcaseSection.tsx`:

- Each row contains the full model list **doubled** (`[...items, ...items]`) at fixed tile widths (`w-28` ≈ 112px on mobile).
- The animation translates the row at the same speed regardless of viewport width.
- On a 440px-wide mobile screen, the row is ~3000px+ wide, so most of it sits off-screen at any moment.
- `loading="lazy"` images that never enter the viewport never resolve their `onLoad`, so `ShimmerImage` shows a permanent skeleton (visible on row 2 e.g. "Rafael" tile).

## Fix

Two combined changes in `src/components/landing/ModelShowcaseSection.tsx`:

### 1. Make the marquee actually visible on mobile

- **Faster animation on mobile** so more models cycle through the visible window per second. Use shorter `durationSeconds` below the `sm` breakpoint (e.g. 60s mobile vs. 120s desktop).
- **Smaller, tighter tiles on mobile** so 3-4 models fit on screen at once instead of 2-3. Reduce mobile size from `w-28 h-36` to `w-24 h-32` and tighten gap from `gap-4` to `gap-3`.
- **Lighter edge fade** on mobile (`w-10` instead of `w-16`) so tiles aren't half-hidden behind the gradient at the edges of a narrow viewport.

### 2. Guarantee images load even when off-screen

- Replace `ShimmerImage` in `ModelCardItem` with a plain `<img>` using `loading="eager"`, `decoding="async"`, `fetchpriority="low"`.
- Use a static `bg-muted/40` placeholder behind the image (no animated shimmer that can stick).
- Keep the existing `errored` → `User` icon fallback.

This ensures all ~30 small avatar tiles fetch immediately on mount (cheap, low-priority so hero LCP is unaffected) and never rely on the unreliable lazy-load + transform interaction on mobile.

## Files touched

- `src/components/landing/ModelShowcaseSection.tsx`
  - `ModelCardItem`: swap `ShimmerImage` for eager low-priority `<img>` + static placeholder; reduce mobile tile size.
  - `BrandModelCTA`: match the new mobile tile size.
  - `MarqueeRow`: shrink mobile edge-fade width; accept and apply a mobile-specific duration via a media-query-aware approach (use Tailwind's `sm:` to swap CSS animation duration via inline style is not possible — instead add a CSS class with a `@media` rule, or pass two durations and pick via a `useIsMobile` hook).
  - Reduce `gap-4` → `gap-3` on mobile.
