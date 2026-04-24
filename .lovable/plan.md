## Changes to /home

### 1. `HomeHowItWorks.tsx` — Step 2 "Choose shots"
- Remove the rotating highlight animation (delete the `hl-1`…`hl-4` keyframes and the absolute overlay div).
- Replace the 2×2 `ImagePlaceholder` grid with a **6×6 grid** of small placeholder tiles to visually communicate "1000+ shots".
  - Use `grid-cols-6 gap-1.5` with tiny rounded squares (`aspect-square rounded-md bg-muted/50 border border-border/30`).
  - Skip rendering icons inside (too small) — just clean tonal squares.
  - Keep one subtle static "selected" tile (e.g. tile index 8) with a soft `ring-2 ring-foreground/70` to imply selection — no animation.
- Keep the top "1000+ shots" pill + search bar header.

### 2. `Home.tsx` — Section order swap
Swap `HomeHowItWorks` and `HomeTrustBlock` so trust appears **after** how-it-works.

New order:
```text
Hero → TransformStrip → CreateCards → HowItWorks → TrustBlock → WhySwitch → OnBrand → PricingTeaser → FAQ → FinalCTA
```

### Notes
- Step 1 (Upload float) and Step 3 (rows fade-in) animations remain unchanged — only Step 2 is de-animated.
- No copy changes; no other components touched.