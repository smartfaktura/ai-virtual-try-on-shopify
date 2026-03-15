

## Fix Picture Perspectives Carousel Transition

### Problem
The current carousel has a broken crossfade mechanism:
- `bgLoaded` is set to `true` once on first load and never resets, so subsequent slides skip the loading state
- Using `key={index}` remounts the `<img>` element each time, causing a flash before the fade animation kicks in
- The "previous" image layer and "current" image layer don't smoothly blend — there's a visible pop/jump between slides

### Solution
Replace the current approach with a proper dual-layer crossfade:
- Render **two** `<img>` elements stacked on top of each other
- Track `currentIndex` and `prevIndex` as separate state
- The bottom layer shows the previous image at full opacity
- The top layer fades in the new image using a CSS transition (`opacity` from 0→1 over 1.2s)
- No `key` remounting — instead toggle a class/style when index changes
- Remove the `bgLoaded` gating for the crossfade (it was only needed for initial load shimmer)

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`** — `CarouselThumbnail`:
- Replace single `index` state with `{ current, prev }` pattern
- Render two `<img>` tags: bottom (prev) and top (current) with `transition: opacity 1.2s ease-in-out`
- On interval tick: move current→prev, advance to next index
- Remove the `wf-carousel-fade` keyframe animation in favor of CSS transition
- Keep shimmer only for initial load, reset `bgLoaded` properly

| File | Change |
|------|--------|
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Rewrite `CarouselThumbnail` crossfade logic with dual-layer smooth transition |

