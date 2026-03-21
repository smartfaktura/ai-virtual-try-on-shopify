

# Premium Polish for TryShot Landing Page

Small, high-impact refinements following 2026 landing page trends (glass morphism, generous whitespace, micro-interactions, editorial typography).

## Changes — `src/pages/TryShot.tsx`

### 1. Entrance animation
Add a fade-in + slide-up on page load. Wrap the hero content in a div with a CSS animation class using Tailwind's `animate-` utility. Add a simple keyframe via inline style or a small `<style>` tag:
- `opacity: 0 → 1`, `translateY(16px) → 0` over 600ms ease-out

### 2. Input field — glass morphism upgrade
Change from `bg-secondary border-border` to `bg-white/80 backdrop-blur-sm border-border/50 shadow-lg shadow-black/[0.03]`. This gives a frosted glass feel that's very 2026.

### 3. Hero showcase image — add floating shadow + remove rotation
Remove `rotate-[-2deg]` (feels gimmicky). Instead add `shadow-2xl shadow-black/10` for a premium floating card effect. Increase size slightly on desktop: `sm:w-72` instead of `sm:w-64`.

### 4. Tighter letter-spacing on headline
Change `tracking-tight` to `tracking-[-0.03em]` (tighter than tight) for modern editorial feel. Bump size slightly: `md:text-6xl`.

### 5. Subtitle — upgrade typography
Change from `text-base` to `text-[15px] leading-relaxed` with `tracking-wide` for refined spacing.

### 6. "Free · No sign-up" text — subtle badge style
Wrap in a small pill: `inline-flex items-center gap-1.5 bg-secondary/60 px-3 py-1 rounded-full` with a tiny green dot before text to signal "live/free".

### 7. Category cards — hover lift effect
Add `transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1` for a subtle lift on hover. Change gradient to `from-black/50` for deeper text contrast.

### 8. Section spacing
Add `border-t border-border/40` above "Works with most products" section for visual separation. Increase `py-16` to `py-20`.

### 9. Nav — add subtle bottom border
Add `border-b border-border/30` to nav for clean separation from content.

## Summary
- 1 file, ~15 class tweaks
- No structural changes, no new dependencies
- Adds: entrance animation, glass input, floating image, editorial typography, hover lifts, refined spacing

