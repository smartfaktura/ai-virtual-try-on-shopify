

## Mobile Hero — "1 Photo → Multiple Results" with Bottom Product Strip

### Current Issue
The product indicator is a tiny pill at the top mixed with scene switcher buttons — it's unclear what the product is, and the "1 photo → many results" story doesn't land visually.

### New Layout

```text
┌─────────────────────────────────┐
│  ← [Out1] [Out2] [Out3] [Out4] →│  Full-width carousel with arrows
│     scene labels overlaid        │  ~160px tall cards, aspect 3/4
├─────────────────────────────────┤
│  ┌────┐                         │
│  │prod│  1 photo → 8 results    │  Product thumb (48x64) + text
│  │img │  [Crop Top][Serum][Ring] │  + scene switcher pills
│  └────┘                         │
└─────────────────────────────────┘
```

### Changes — `src/components/landing/HeroSection.tsx` (mobile block, lines 249-310)

1. **Move product to bottom row**: Product thumbnail (48×64px, rounded-lg) on the left, with bold text "1 photo → 8 results" next to it, followed by scene switcher pills on the right
2. **Add left/right arrow buttons**: Small circular chevron buttons (`ChevronLeft`/`ChevronRight`) flanking the output scroll strip for clear navigability
3. **Make output cards bigger**: Increase from `w-[140px]` to `w-[160px]` so they're more impactful
4. **Remove the "1 photo" pill** from the top — it moves to the bottom context row
5. **Caption** stays below everything

This makes the "1 product photo → many styled outputs" story immediately clear, with arrows signaling there's more to explore.

