

## Add Freestyle Studio Showcase Section to Landing Page

Create a new animated section on the landing page that demonstrates the Freestyle Studio experience — showing prompt typing, chip selections (model, scene, style), and generated results in an engaging, interactive demo.

### New Component

**`src/components/landing/FreestyleShowcaseSection.tsx`**

An animated mock-up of the Freestyle Studio interface that auto-plays through a demo sequence:

1. **Simulated prompt bar** — A typewriter effect types out a creative prompt (e.g., "Editorial portrait in golden hour light, wearing our summer collection...")
2. **Animated chip selections** — Chips light up sequentially to simulate selecting: Model (e.g., "Sofia"), Scene (e.g., "Rooftop Terrace"), Style (e.g., "Editorial"), Aspect Ratio (e.g., "4:5")
3. **Generate button pulse** — The "Generate" button activates with a shimmer/pulse
4. **Result reveal** — A grid of 3-4 result cards fade/scale in, showing the "output" with labels

Layout:
- Left side: text block with headline ("Your Creative Studio. No Limits."), subtitle explaining Freestyle, feature bullets (custom prompts, mix models + scenes, style presets, any aspect ratio), and CTA button
- Right side: the animated demo mockup (styled like a simplified version of the real UI — rounded card with prompt textarea, chip row, generate button, and result thumbnails)

The animation loops on a ~10s cycle using `useEffect` timers + CSS transitions. No real images needed — use gradient placeholder cards for "results" with labels.

### Landing Page Integration

**`src/pages/Landing.tsx`** — Insert `<FreestyleShowcaseSection />` after `<HowItWorks />` and before `<ProductCategoryShowcase />`, since Freestyle is the primary creation mode and should appear prominently.

### Animation Sequence (auto-looping)

```text
[0s]   Empty prompt bar, chips inactive
[0.5s] Typewriter starts: "Editorial portrait, golden hour..."
[3s]   Prompt done → Model chip highlights "Sofia"
[4s]   Scene chip highlights "Rooftop Terrace"
[5s]   Style chip highlights "Editorial"
[6s]   Generate button pulses
[7s]   Result cards fade in one by one (staggered 200ms)
[9s]   Hold results
[10s]  Reset → loop
```

Uses existing animation utilities (`animate-fade-in`, `animate-scale-in`) plus a custom typewriter via `useState`/`useEffect` — similar pattern to the hero's `useTypewriter` hook.

