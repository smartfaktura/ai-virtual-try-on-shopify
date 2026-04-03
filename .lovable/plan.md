

# Revised Hero & TransformStrip — Marquee Ticker Approach

## The Problem with 3x3
At ~150×200px per card, the images become thumbnails. The whole point is showing off visual quality — tiny cards defeat that.

## Better Idea: Double-Row Marquee

Two rows of cards **continuously auto-scrolling in opposite directions**, like a film strip. Cards are much larger because they only need to fit 2 rows (not 3). The infinite scroll means all 9 categories cycle through naturally — the user sees everything without clicking or scrolling.

```text
Desktop hero right side:

  ← ← ← [Product page] [Social Media] [Editorial] [Ad Creatives] [UGC Style] ← ← ←
  → → → [Selfie] [Flat Lay] [Video] [Perspectives] [Product page] → → → 
```

- **Row 1**: scrolls left slowly (~30s loop)
- **Row 2**: scrolls right slowly (~35s loop, slight speed difference for organic feel)
- Each card: ~200×267px on desktop (aspect 3/4), large enough to see detail
- Each card still crossfades its images every 1s — so there's movement both within cards AND across the strip
- Category label on each card
- Pauses on hover so user can look closely
- CSS `@keyframes` animation — no JS scroll needed, very performant

### With "Original" anchor
A static "Your photo" Original card floats at the left edge or top-left corner, visually anchoring the "1 photo" input. The marquee rows flow out from it to the right.

### Mobile
Same concept but single row marquee, cards slightly smaller (~140×187px). Still big enough to read. Continuous scroll keeps it dynamic.

## TransformStrip Section

Replace the cramped grid with the same marquee concept but wider (full-width section). Two rows scrolling opposite directions. Larger cards (~220×293px). The section title "From one product photo to every asset you need" already explains the concept, so the marquee just needs to look impressive.

## Why This Works
- Cards are 2-3x larger than a 3x3 grid
- User sees all 9 categories without any interaction
- Constant motion draws the eye — feels alive and premium
- No scrolling, no clicking, no tabs needed
- Scales perfectly to any screen width (marquee just wraps)

## Files Modified
- `src/components/home/HomeHero.tsx` — marquee ticker layout
- `src/components/home/HomeTransformStrip.tsx` — same marquee approach, full-width

