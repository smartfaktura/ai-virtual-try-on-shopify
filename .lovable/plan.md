

# Redesign FreestylePromptCard

## Problem
The current card has an overly complex animation with tiny elements (8px text, 3.5px avatars) that look broken at card size. The result image grid shows tall empty skeletons most of the cycle, making the card look unfinished compared to the clean `WorkflowCardCompact` cards beside it.

## Approach
Strip the complex cycle animation. Replace with a clean, static-first design that matches `WorkflowCardCompact` structure (thumbnail area + content below) but with a distinctive "prompt" visual identity. Keep it simple and polished.

## Design

The visual area will show a static collage of 3 result images (the same assets) in an overlapping/stacked layout with a subtle frosted prompt bar overlay — no animation cycle, no typing effect, no chip states. A small `Sparkles` icon badge differentiates it from workflow cards.

```text
┌─────────────────────┐
│  ┌───┐ ┌───┐ ┌───┐  │  ← 3 images, object-cover
│  │   │ │   │ │   │  │    in a grid, always visible
│  │   │ │   │ │   │  │
│  │   │ │   │ │   │  │
│  └───┘ └───┘ └───┘  │
│  ┌─ "Describe any…"─┐│  ← frosted prompt hint bar
│  └───────────────────┘│
├─────────────────────┤
│ ✦ Freestyle Studio   │
│ Describe any shot... │
│ [Create with Prompt →]│
└─────────────────────┘
```

## Changes

**File: `src/components/app/FreestylePromptCard.tsx`** — Full rewrite

1. Remove all animation state (`cycle`, `typedText`, `activeChips`, `generating`, `progress`, `showResults`, `visibleResults`, timers, intervals)
2. Keep `RESULT_CARDS` images with quality-only optimization (no width param)
3. Visual area: static 3-col grid of result images with `object-cover`, always visible
4. Overlay: a small frosted prompt hint at the bottom of the visual area (`"Shoot my crop top on a court, studio, and café"`)
5. Content area: matches `WorkflowCardCompact` — title, description, CTA button with same sizing/classes
6. Keep `mobileCompact` prop for responsive behavior (matching WorkflowCardCompact patterns)
7. Add a `Sparkles` icon accent near the title to differentiate from regular workflow cards

**No other files changed.** The component interface (`onSelect`, `mobileCompact`) stays identical.

