

# Hero Redesign — Visuals First, Controls Below

## Problems
- 50/50 split wastes space on images; text area too wide
- "Your photo" + pills sit above marquee, pushing visuals down
- Mobile: text not visible (marquee takes over)
- Image crossfade happens on all 9 cards — should only be on "Product page" and "Perspectives"

## Layout Changes

### Desktop: 40/60 split
Change grid from `lg:grid-cols-2` to `lg:grid-cols-[2fr_3fr]` — gives ~40% to copy, ~60% to the marquee area. More visual real estate.

### Move "Your Photo" + Pills below the marquee
Instead of sitting above the marquee (pushing images down), place a row **below** the two marquee rows:

```text
┌─────────────────────────────────────────────┐
│  Copy (40%)  │  Marquee Row 1 →             │
│              │  ← Marquee Row 2             │
│              │                              │
│              │  [📷 Your Photo] [Fashion] [Jewelry] [Home] [Beauty]  │
└─────────────────────────────────────────────┘
```

The "Your photo" thumbnail sits inline with the pills in a compact bar below the marquee. Slightly bigger thumbnail (~w-14 h-[70px]). This keeps the visual showcase front and center.

### Image rotation: only on "Product page" and "Perspectives"
- Cards at index 0 (Product page) and index 8 (Perspectives) keep the crossfade rotation at 1s intervals
- All other 7 cards show a **single static image** (first image in their array) — no rotation
- This draws attention to the two key categories without visual overload

### Mobile fixes
- Stack vertically: copy block first (visible, compact padding), then marquee rows, then pills row
- Ensure h1, subtitle, and CTA buttons are fully visible before scroll
- Reduce `pt-24` to `pt-20` on mobile for tighter spacing

## File Modified
- `src/components/home/HomeHero.tsx`

