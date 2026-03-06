

## Add scroll-triggered animations to How It Works steps

Subtle animations that reveal each step as the user scrolls down, guiding the eye through the flow.

### Approach

Use **Intersection Observer** via a small custom hook to detect when each step enters the viewport, then apply staggered fade-in + slide-up animations. No design changes -- just motion.

### Animations per step

| Element | Effect |
|---|---|
| **Step text block** (number + title + description) | Fade in + slide up from 30px below |
| **Step card** (upload card, selector card, grid card) | Fade in + slide up with ~150ms delay after text |
| **Step 3 grid images** | Staggered reveal -- each image fades in with 80ms delay between them |
| **Step number badges** (01, 02, 03) | Subtle scale-in when visible |
| **Platform chips** (Step 1) | Staggered fade-in, 50ms apart |

### Implementation

**`src/components/landing/HowItWorks.tsx`**
- Add a `useInView` hook (inline, using `IntersectionObserver` with `threshold: 0.15`, `triggerOnce: true`)
- Wrap each step's text and card in a div with `ref` from the hook
- Apply conditional classes: `opacity-0 translate-y-8` by default, transitioning to `opacity-100 translate-y-0` when in view
- Use inline `transitionDelay` for staggered elements (cards, grid images, chips)
- Step 3 scene images get individual staggered delays (0ms, 80ms, 160ms, etc.)

### Files changed
- `src/components/landing/HowItWorks.tsx` -- add intersection observer logic and transition classes

