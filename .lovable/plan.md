

## Animate How It Works — Sequential Reveals + Drag-Drop Motion

Two targeted animation additions to make the steps feel alive and guide the eye naturally.

### 1. Step 1 — Drag-and-Drop Animation

When the Step 1 card enters the viewport, play a CSS keyframe sequence:
- The product thumbnail (White Crop Top) starts **above** the upload zone, slightly rotated (~3deg), with a subtle shadow
- It **floats down** into the card's product row over ~800ms with an easing curve
- On landing, a brief scale bounce (1.02 → 1.0) and the "Ready" dot pulses
- This plays once when `step1Card.inView` becomes true, using a `useState` + `useEffect` to trigger a class swap after a delay

Implementation: Add a CSS `@keyframes drag-drop-in` animation in the component (inline style or tailwind `animate-` extension). The product row gets `position: relative` and the thumbnail gets animated `translateY` + `rotate`.

### 2. Step 2 — Sequential "Product + Model + Scene → Result" Reveal

Instead of the whole selection row appearing at once, each element appears one by one:
- **Product** thumbnail fades in + scales up (0ms delay)
- **"+"** icon fades in (300ms)
- **Model** thumbnail fades in + scales up (500ms)
- **"+"** icon fades in (800ms)
- **Scene** thumbnail fades in + scales up (1000ms)
- **"→"** icon fades in (1300ms)
- **Result** thumbnail fades in + scales up with a slight glow/ring pulse (1500ms)

Each `HoverPreview` and connector icon gets individual `opacity`/`transform` transitions controlled by `step2Card.inView` with staggered `transitionDelay` values. The eye naturally follows left-to-right as each piece appears.

### Files Changed
- `src/components/landing/HowItWorks.tsx` — add drag-drop keyframe animation for Step 1, staggered sequential reveal for Step 2 selection row

