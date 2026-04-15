

# Redesign Freestyle Studio Card — ChatGPT-Style Prompt Bar

## Summary
Replace the current branching/direction cards design with a clean, ChatGPT-inspired prompt bar as the hero element. The card centers around a single elegant text input simulation with a typewriter animation and a subtle blinking cursor — minimal, premium, no icons as decorative labels.

## Creative Concept

The entire visual area is dominated by one thing: a premium dark prompt bar (like ChatGPT's input field) with text typing itself out. Below it, 3 small "result" pills fade in to suggest multiple outputs. No branching SVGs, no direction cards with icons, no emojis.

```text
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │  Shoot my crop top on a     │   │
│   │  court, studio, and café▌   │   │  ← dark input bar, typewriter + cursor
│   │                             │   │
│   │                     ↗       │   │  ← send arrow, subtle
│   └─────────────────────────────┘   │
│                                     │
│     Studio    Court    Café         │  ← 3 minimal text pills fade in
│                                     │
├─────────────────────────────────────┤
│  Freestyle Studio                   │
│  Type anything. Get styled visuals. │
│  ┌─────────────────────────────┐    │
│  │      Start Creating    →    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Changes

**File: `src/components/app/FreestylePromptCard.tsx` — Full rewrite**

### Visual area
1. **Prompt input bar** — A rounded-2xl container styled like a modern AI chat input:
   - Dark surface (`bg-muted/40` with `border border-border/30`)
   - Multi-line text area feel (taller, ~80px)
   - Typewriter animation on the prompt text using CSS `steps()` + `overflow: hidden` + `border-right` blinking cursor
   - Small send/arrow-up icon in bottom-right corner (muted, not a real button)
   - Prompt text: "Shoot my crop top on a court, studio, and café"

2. **Result pills** — 3 minimal rounded-full pills below the input bar:
   - Just text labels: "Studio", "Court", "Café"
   - `bg-muted/20 border border-border/20` — very subtle
   - Staggered fade-in after typewriter completes
   - No icons, no sub-labels

3. **Ambient glow** — Soft radial gradient behind the prompt bar (primary/5)

### Animations (CSS-only, no JS)
- **Typewriter**: `width` animates from 0 to 100% using `steps(42, end)` over ~3s, with `border-right: 2px solid` as blinking cursor
- **Cursor blink**: separate `@keyframes blink` toggling `border-color` opacity
- **Result pills**: `opacity 0→1, translateY 4px→0`, staggered at 3.2s, 3.5s, 3.8s (after typing completes)
- **8s total loop**: everything fades out at ~7s, resets at 8s with `infinite` iteration

### Content area (below)
- Title: "Freestyle Studio" (no Sparkles icon — cleaner)
- Subtitle: "Type anything. Get styled visuals."
- CTA: "Start Creating" with ArrowRight, same rounded-full button style

### What's removed
- Branching SVG lines
- Direction cards with Sun/Zap/Coffee icons
- Sparkles icon from title
- Shimmer text effect on prompt (replaced by typewriter)

### Responsive
- `mobileCompact`: smaller prompt bar height, tighter text, pills may shrink

