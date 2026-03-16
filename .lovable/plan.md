

## Plan: Simplify Picture Perspectives carousel animation

The current `CarouselThumbnail` uses a dual-layer crossfade with 1.2s opacity transition and a 5-second interval. The user wants a simple instant image swap every 1 second — no fading.

### Changes

**File: `src/components/app/WorkflowAnimatedThumbnail.tsx`** (CarouselThumbnail function, ~lines 151-272)

1. Change `INTERVAL` from `5000` to `1000`
2. Remove the dual-layer crossfade logic (`prev`, `showCurrent`, the bottom "previous image" layer)
3. Keep a single `<img>` that just swaps `src` instantly via `current` index — no opacity transition
4. Remove the progress bar (too fast at 1s to be useful)
5. Keep the floating badge elements and shimmer placeholder as-is

