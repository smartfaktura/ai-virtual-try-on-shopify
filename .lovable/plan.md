

# Fix Flashing Transitions in Category Showcase

## Problem
The `ShimmerImage` uses `key={`cur-${currentIndex}`}` which forces React to unmount and remount the entire image element on every transition. This causes a flash — the old image disappears instantly, then the new one fades in from the shimmer placeholder.

## Solution
Layer two `ShimmerImage` elements (current and next) and crossfade between them using CSS opacity transitions instead of React key-based remounting.

### Changes in `src/components/landing/ProductCategoryShowcase.tsx`

**Replace the single keyed `ShimmerImage`** with two persistent layers:
- **Bottom layer (z-index 1)**: shows the "previous" image (stays visible during fade)
- **Top layer (z-index 2)**: the incoming image fades in via `opacity` transition

**New state model**:
- `displayIndex` — the currently visible (bottom) image
- `incomingIndex` — the next image fading in on top
- `fadeIn` — boolean toggled to trigger the CSS opacity transition
- When the fade completes (`onTransitionEnd`), swap `displayIndex` to `incomingIndex` and prepare the next preload

**Transition flow**:
1. Preload next image via `Image()` object → sets `nextReady = true`
2. Timer fires → set `incomingIndex` and `fadeIn = true`
3. Top layer fades from `opacity-0` to `opacity-100` over 500ms
4. `onTransitionEnd` → update `displayIndex`, reset `fadeIn`, advance to next

**No `key` prop on either `ShimmerImage`** — images swap via `src` changes, not remounting. The shimmer inside `ShimmerImage` handles the brief load naturally for uncached images, while cached images appear instantly.

This gives a smooth crossfade with zero flashing, matching the quality of the Environment Showcase marquee.

