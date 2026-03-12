

## Fix Upscale Animation: Reduce Blur + Eliminate Flash on Loop Reset

### Problems
1. **Blur too strong** — `blur(6px)` looks unnatural; needs to be subtler
2. **Flash on loop reset** — The component uses `key={iteration}` which unmounts/remounts everything, causing a visible flash when the cycle restarts

### Changes — `src/components/app/WorkflowAnimatedThumbnail.tsx`

#### 1. Reduce blur intensity
- Change `filter: 'blur(6px) saturate(0.9)'` to `filter: 'blur(3px) saturate(0.95)'`
- Reduce scale compensation from `1.06` to `1.03` (less blur = less edge bleed to hide)

#### 2. Eliminate flash on loop reset
Instead of re-keying the component on each iteration (which destroys and recreates all DOM elements causing a flash), use CSS animation iteration or a state-driven approach:
- Remove `key={isActive ? iteration : 'static'}` from the container
- Use a `phase` state that cycles through: `'blur'` → `'wiping'` → `'sharp'` → back to `'blur'`
- On reset, **cross-fade** the sharp image out (opacity transition) while keeping the blurred layer always visible underneath — no abrupt unmount
- Timeline: blur visible 1s → wipe 1.5s → hold sharp 2s → fade sharp out over 0.5s → loop

This eliminates the jarring re-render flash entirely.

