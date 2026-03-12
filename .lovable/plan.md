

## Improve Image Upscaling Animation — Blur-to-Sharp Before/After

### Concept
Replace the current generic badge-based animation for "Image Upscaling" with a **blur-to-sharp reveal** effect. The thumbnail starts blurred (simulating a low-res image), then transitions to sharp with a horizontal wipe/slider, mimicking a classic before/after comparison.

### Changes — 2 files

#### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx`
Add a new scene `mode: 'upscale'` that renders a dedicated **UpscaleThumbnail** component:

- Same background image rendered **twice** — one blurred (CSS `filter: blur(6px) saturate(0.9)` + slight scale to hide blur edges), one sharp
- A **horizontal reveal wipe**: the sharp image clips from left to right using `clip-path: inset(0 X% 0 0)` animated from 100% to 0%
- A thin **vertical divider line** (white, 2px) tracks the wipe edge position
- **"Before" / "After" badges**: "Blurry" badge on the left fades in first, then the wipe begins, and an "Enhanced 4K" badge pops in on the right side once revealed
- A **Sparkles shimmer sweep** runs across the sharp side as it reveals
- The animation loops: blur visible (1s pause) → wipe reveal (1.5s) → hold sharp (2s) → reset

Timeline:
- 0.0s — Blurred image visible, "Original" badge slides in top-left
- 0.8s — Wipe begins left-to-right
- 2.3s — Wipe complete, "Enhanced 4K" badge pops bottom-right
- 4.0s — Reset / loop

#### 2. `src/components/app/workflowAnimationData.tsx`
Update the `'Image Upscaling'` scene entry:
- Set `mode: 'upscale'`
- Remove the badge/action elements (the UpscaleThumbnail handles its own overlays)
- Keep the background image (headphones on yellow — good high-detail subject)

### New keyframes needed (in UpscaleThumbnail style tag)
- `wf-upscale-wipe`: animates `clip-path` from `inset(0 100% 0 0)` to `inset(0 0% 0 0)`
- `wf-divider-move`: moves the vertical line from `left: 0%` to `left: 100%` in sync with the wipe

