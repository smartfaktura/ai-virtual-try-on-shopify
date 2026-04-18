

## Smooth dashboard render — eliminate layout shift & scroll re-loading

### Root causes
1. **Layout jumps on first paint** — Discover (`DashboardDiscoverSection`) and RecentCreations skeletons collapse/expand to different sizes, plus the H1 swaps between "Welcome" / "Welcome back" once `hasGenerated` resolves.
2. **"Re-loading while scrolling"** — every below-the-fold image is `loading="lazy"` with a shimmer overlay. As you scroll, each card flashes its shimmer before the image decodes. The 10 autoplay `<video>` tags in "Your Products, In Motion" also only start downloading/playing when scrolled into view, looking like the page is re-loading.
3. **Unnecessary re-renders** — `RecentCreationsGallery` polls every 60s; `ShimmerImage` runs `new Image()` inside `useState` initializer on every render (still cheap but flaky).

### Fixes

**1. Stable hero height (no copy flicker)**
`src/pages/Dashboard.tsx`: reserve hero greeting space — render `Welcome…` immediately and only swap to `Welcome back` once `hasGenerated !== undefined`. Already done for greeting; also gate "Continue creating" / "Create now" behind `hasGenerated !== undefined` to avoid a second flicker once data lands. Use `useMemo` so re-renders are cheap. (Tiny copy tweak — page height stays identical because both labels are short.)

**2. Stable section heights — reserve space with `min-h`**
For both async sections render a wrapper with `min-h-[~grid-height]` so the skeleton and the loaded grid occupy the same vertical space. This stops the page from "jumping" once data arrives.
- `DashboardDiscoverSection`: wrap in `min-h-[820px] sm:min-h-[760px] lg:min-h-[680px]` (16 cards · 3:4 aspect at 4-col).
- `RecentCreationsGallery`: wrap in `min-h-[680px] sm:min-h-[480px] lg:min-h-[360px]` (8 cards · 3:4 at 4-col).

**3. Eager-load above-the-fold images, drop shimmer on first row**
- `DashboardDiscoverSection`: pass `loading="eager"` (and skip ShimmerImage shimmer) for the **first 4–8 cards** (above the fold on desktop/mobile) so they appear immediately with the rest of the page, not after scrolling triggers their lazy load.
- `RecentCreationsGallery`: same — first 4 cards eager, rest lazy. (Already preloads via `new Image()` but still uses `loading="lazy"` which delays the actual `<img>` request — switch to `loading="eager"` for first 4 and remove the `useEffect` preloader since it becomes redundant.)
- Add `fetchPriority="high"` on the very first card of each grid.

**4. Video showcase — preload metadata only, smooth in-viewport play**
The 10 `<video>` tags use default `preload="metadata"` already, but Safari/Chrome on mobile can pause/resume them as they enter viewport, causing the "loading again" sensation. Add `preload="none"` + an `IntersectionObserver`-based lazy play (or simpler: use `poster` attribute pointing to a static thumbnail of the first frame so the slot is filled instantly with an image, and the video starts when it enters view). Simplest fix without extra assets: keep videos but wrap in a `min-h` container and add `poster="/placeholder.svg"` so empty black frames don't appear.
Better: lazy-mount the video element only when its container enters the viewport (use a tiny `LazyVideo` component) — this also reduces initial bandwidth.

**5. Tighten `RecentCreationsGallery`**
- Drop `refetchInterval: 60_000` → use only `staleTime` + manual refetch on focus. (60 s polling causes re-renders and image churn.)
- Increase `staleTime` to 5 min.
- Remove the `useEffect` image-preload now that the first 4 use `loading="eager" fetchPriority="high"`.

**6. `ShimmerImage` micro-fix**
Replace the `new Image()` inside `useState(() => …)` with a proper `useEffect` cache check, and skip rendering the shimmer overlay entirely when `loading="eager"` (those images are part of the initial paint and the shimmer is just visual noise).

### Acceptance
- Initial dashboard paint shows hero + skeletons of every section at their final heights → no layout jumps when data lands.
- Scrolling top-to-bottom: above-the-fold cards already loaded, below-the-fold cards still lazy-load but no full-page "reload" feel — videos appear with poster instantly.
- No copy flicker between "Welcome" / "Welcome back".
- No regression on data freshness (queries still refetch on mount + focus).

### Files touched
- `src/pages/Dashboard.tsx` — stable copy gating, `min-h` wrappers, lazy `<video>` (or poster).
- `src/components/app/DashboardDiscoverSection.tsx` — pass eager flag to first 4–8 cards, `min-h` skeleton.
- `src/components/app/DiscoverCard.tsx` — accept `eager`/`fetchPriority` props.
- `src/components/app/RecentCreationsGallery.tsx` — eager first 4, drop polling, drop preload effect.
- `src/components/ui/shimmer-image.tsx` — cleaner cache check, suppress shimmer when eager.
- (optional new) `src/components/ui/LazyVideo.tsx` — IntersectionObserver-mounted video for the showcase row.

