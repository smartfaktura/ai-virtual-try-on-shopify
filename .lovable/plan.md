

# Optimize Product Visuals Carousel: Reduce to 8 Images + Add Width Constraint

## Problem
The 16 `pvImages` are raw Supabase URLs — they bypass the `s()` helper entirely, so they load at full resolution with no quality or width optimization. The carousel also lacks width constraints in its rendering component, making every tick fetch a heavy image.

## Changes

### 1. `src/components/app/workflowAnimationData.tsx`
- **Route pvImages through the optimizer**: Wrap each URL with `getOptimizedUrl(url, { quality: 60, width: 600 })` — 600px is plenty for a ~300px card at 2x retina.
- **Cut from 16 to 8 images**: Keep the 8 most visually diverse images (indices 0, 2, 3, 5, 7, 10, 12, 14 — a good mix).

### 2. `src/components/app/WorkflowAnimatedThumbnail.tsx` (line 238)
- Add `width: 600` to the `getOptimizedUrl` call in `CarouselThumbnail` so ALL carousel workflows benefit, not just Product Visuals:
  ```typescript
  () => rawBackgrounds.map((bg) => getOptimizedUrl(bg, { quality: 60, width: 600 })),
  ```
- Add a preload effect that eagerly fetches the next 2 images ahead of the current index using `new Image()`, preventing flash/shimmer on rotation.

## Impact
- 2 files changed
- ~60-70% smaller per-image payload (width-constrained + quality 60)
- 8 images instead of 16 — half the total bandwidth
- Preloading eliminates shimmer flash between carousel ticks

