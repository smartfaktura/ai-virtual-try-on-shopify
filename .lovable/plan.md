

## Dashboard scroll lag investigation

### Problem
User reports `/app` dashboard lags during fast scroll (up or down) even after the page has fully loaded. Need to identify the cause and propose a fix.

### Hypothesis (from code review)

Looking at `src/pages/Dashboard.tsx`, the most likely culprit is the **Video Showcase section**:

```tsx
{Array.from({ length: 10 }, (_, i) => (
  <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
    <LazyVideo src={`/videos/showcase/showcase-${i + 1}.mp4`} />
  </div>
))}
```

Combined with `LazyVideo` behavior:
- 10 autoplay/loop `<video>` elements stacked in a grid
- `IntersectionObserver` with `rootMargin: 200px` mounts videos eagerly
- Once mounted, videos stay mounted forever — even when scrolled far away
- All 10 videos play simultaneously after a single scroll-through, decoding frames continuously

Additional suspects:
1. `RecentCreationsGallery` — likely contains more media
2. `DashboardDiscoverSection` — image/video grid
3. No `content-visibility: auto` on heavy sections, so the browser repaints/relayouts everything during scroll

### Plan

**1. Make `LazyVideo` truly lazy (mount AND unmount)**
Change `LazyVideo` so that when a video scrolls **out** of view (with a generous margin), it pauses and unmounts. Re-mounts when it scrolls back in. This caps the number of simultaneously-decoding videos to ~3-5 at any time instead of all 10+.

```tsx
// Keep observer alive (don't disconnect after first intersection)
// Track isIntersecting state, unmount when out of view + buffer
```

Use a larger `rootMargin` for unmount (e.g., 600px) than mount (200px) to avoid thrash near the edge.

**2. Add `content-visibility: auto` to heavy sections**
Wrap the Video Showcase, RecentCreationsGallery, and DashboardDiscoverSection in containers with:
```tsx
style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
```
This lets the browser skip painting/layout for off-screen sections during scroll.

**3. Reduce `preload` aggressiveness**
Already `preload="metadata"` — good. Confirm no change needed.

**4. (Optional) Throttle simultaneous playback**
If unmount/remount alone isn't enough, add a small `IntersectionObserver` ratio threshold so videos only `play()` when ≥50% visible, and `pause()` otherwise — keeps DOM but stops frame decoding.

### Files to change
- `src/components/ui/LazyVideo.tsx` — proper mount/unmount + pause-on-leave
- `src/pages/Dashboard.tsx` — add `content-visibility: auto` to the 3 heavy sections (Video Showcase, RecentCreationsGallery wrapper, DashboardDiscoverSection wrapper)

### Acceptance
- Fast scroll up/down on `/app` feels smooth on desktop and tablet
- At most ~4-5 videos actively decoding at once
- Off-screen sections don't trigger layout/paint during scroll
- No visible flicker when videos re-enter viewport
- Mobile experience unchanged or improved

