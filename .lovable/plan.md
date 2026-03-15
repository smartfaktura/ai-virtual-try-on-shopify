

## Fix Mobile Menu Animation Glitch in LandingNav

### Problem
The mobile menu uses `max-h-0 → max-h-80` combined with `opacity-0 → opacity-100` in a single `transition-all duration-300`. This causes two issues:

1. **Opacity and height animate simultaneously** — the content fades in while still expanding, creating a "transparent flash" where you briefly see semi-transparent content sliding into place
2. **`backdrop-blur-xl`** on the inner div is expensive to animate, causing jank on mobile GPUs
3. **`transition-all`** transitions every property (border, shadow, opacity, max-height) at once, which is heavy

### Fix

**`src/components/landing/LandingNav.tsx`** (~lines 87-92):

1. **Remove opacity animation entirely** — keep content always `opacity-100`. The `max-h` + `overflow-hidden` already hides the content; fading it too causes the transparent glitch.
2. **Replace `transition-all`** with explicit `transition-[max-height]`** — only animate the height, not border/shadow/opacity. This is much cheaper.
3. **Use `will-change-[max-height]`** on the container to hint the GPU.
4. **Move `backdrop-blur-xl`** to the outer container (or remove the double-nesting) so the blur isn't being composited during the height animation.

The closed state becomes: `max-h-0 border-transparent shadow-none` (no opacity-0).
The open state becomes: `max-h-80` (no opacity-100).
Transition: `transition-[max-height] duration-300 ease-in-out`.

This eliminates the opacity flash and reduces the number of properties being animated, fixing the lag.

