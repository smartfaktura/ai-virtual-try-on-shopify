

# Redesign Freestyle Studio Card — Motion-Led, No Images

## Summary
Replace the current image-collage-based FreestylePromptCard with a motion-led, typography-driven card that uses animated branching from a prompt strip into 3 text-based output direction cards. No photography or imagery.

## Changes

**File: `src/components/app/FreestylePromptCard.tsx` — Full rewrite**

### Structure (top to bottom)
1. **Title area** — Sparkles icon + "Freestyle Studio" (font-bold) + subtitle "Turn a simple prompt into styled, brand-ready visuals"
2. **Visual area** (replaces image collage) — dark/muted background panel:
   - **Prompt strip** — frosted glass bar with Sparkles icon + typing shimmer on the text "Shoot my crop top on a court, studio, and café"
   - **Branching lines** — 3 SVG lines animating outward from prompt center to 3 cards below, with staggered draw-on animation via CSS `stroke-dashoffset`
   - **3 output direction cards** — small bordered cards with text only, activating in sequence:
     - "Clean Studio" / subtle light icon
     - "Sport Motion" / bold energy
     - "Warm Social" / lifestyle feel
   - Soft ambient glow behind the prompt strip (radial gradient pseudo-element)
3. **CTA** — "Create with Prompt" button with ArrowRight, matching existing button style

### Animations (CSS keyframes in component via Tailwind arbitrary or inline styles)
- Prompt strip: subtle shimmer/gradient sweep across text (like a typing highlight)
- SVG branching lines: `stroke-dasharray` + `stroke-dashoffset` animation, staggered 0.3s apart
- Output cards: fade-in + slight translateY, staggered 0.5s, 0.8s, 1.1s
- CTA arrow: `group-hover:translate-x-0.5` shift
- All animations trigger on mount, CSS-only (no JS intervals)

### Responsive
- `mobileCompact` mode: reduce padding, smaller text, tighter spacing, shorter visual area
- Non-compact: more spacious padding (p-5/p-6), generous gaps between sections

### What's removed
- All `RESULT_IMAGES`, `ShimmerImage` imports, `getLandingAssetUrl`, `getOptimizedUrl` imports
- The 3-column image grid
- The frosted prompt overlay on images

### Visual style
- Visual area: `bg-muted/10` or `bg-gradient-to-b from-muted/20 to-background` — soft, not heavy
- Output cards: `border border-border/40 rounded-lg` with subtle `bg-muted/30`
- Branching lines: `stroke-primary/20` with thin 1px strokes
- Overall card keeps existing `Card` wrapper with same hover behavior

