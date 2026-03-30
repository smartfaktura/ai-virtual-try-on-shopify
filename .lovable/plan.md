

## Fix: Slow /discover Loading in In-App Browsers (Instagram/Meta)

### Root causes

In-app browsers (Instagram, Facebook) use a stripped-down WebView with fewer concurrent connections (~4-6 vs ~12 in Chrome), slower JS execution, and more aggressive resource throttling. The /discover page hits all of these limits:

1. **30 images rendered immediately** — `INITIAL_RENDER_COUNT = 30`. Each triggers a network request, saturating the in-app browser's limited connection pool.

2. **Full-size images downloaded** — `getOptimizedUrl(imageUrl, { quality: 60 })` compresses quality but never sets a `width`, so every card downloads the original-resolution image (often 1500px+). On a 390px mobile screen with 2 columns, each card is ~195px wide.

3. **ShimmerImage creates phantom image objects** — On mount, every ShimmerImage runs `new Image(); img.src = src` to check browser cache (line 38-43). With 30 cards, this creates 30 preload requests *before* the browser even evaluates `loading="lazy"`, defeating lazy loading entirely.

4. **4 parallel API calls on mount** — `discover_presets`, `get_public_custom_scenes`, `get_hidden_scene_ids`, `get_public_featured_items` all fire simultaneously, competing with image requests.

### Plan

**1. Reduce initial render count on mobile**
- In `PublicDiscover.tsx`, change `INITIAL_RENDER_COUNT` from 30 to a responsive value: 12 on mobile (`< 640px`), 20 on tablet, 30 on desktop.

**2. Add width parameter to DiscoverCard image optimization**
- In `DiscoverCard.tsx`, pass `width: 400` to `getOptimizedUrl()` for card images. This uses Supabase's image transformation to serve ~400px wide images instead of full-resolution, cutting download size by 60-80%.

**3. Fix ShimmerImage eager preloading**
- In `shimmer-image.tsx`, skip the `new Image()` cache probe when the component has `loading="lazy"`. Only run the eager check for `loading="eager"` or `fetchPriority="high"` images. This prevents 30 simultaneous preloads that bypass native lazy loading.

**4. Reduce concurrent API calls**
- In `PublicDiscover.tsx`, the hidden scenes and featured items queries don't need to fire until presets have loaded. Add `enabled: presets.length > 0` to defer them, reducing initial concurrent requests from 4 to 2.

### Files to edit
- `src/pages/PublicDiscover.tsx` — responsive initial count, deferred queries
- `src/components/app/DiscoverCard.tsx` — add width to image optimization
- `src/components/ui/shimmer-image.tsx` — skip eager cache check for lazy images

### Technical detail

```text
Before (in-app browser timeline):
  0ms   ─ 4 API calls + 30 image preloads (new Image()) ─ connection pool saturated
  200ms ─ JS still parsing, images queued
  2-5s  ─ images trickle in one by one

After:
  0ms   ─ 2 API calls only
  100ms ─ 12 small (400px) images with native lazy loading
  300ms ─ remaining 2 API calls fire
  ~1s   ─ page visually complete
```

