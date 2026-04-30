# Fix Home Hero Loading & Painting Order

## Why it happens today

Looking at `src/components/home/HomeHero.tsx`:

1. **Original appears last** — The "Original" card uses a bundled asset (`src/assets/home-hero-original-dress.jpg`, **336 KB raw**) served with no width/quality transform and no srcSet. Every other card uses a tiny ~30–60 KB Supabase-CDN optimized JPG (`width: 480, quality: 85`) with a srcSet. So the lightweight previews paint first; the heavy raw original arrives last. The `<link rel="preload">` is injected by `react-helmet-async` after React mounts, so the browser preload scanner never sees it in the initial HTML — the preload hint is effectively wasted.

2. **"Loading is crashing / images appearing in parts"** — Row 1 doubles 6 cards → 12 nodes; Row 2 doubles 13 cards → 26 nodes. That's **38 `<img>` requests fired in parallel on first paint** plus a **689 KB autoplaying `<video>`** (the 2nd card). Even with `loading="lazy"`, the marquee places all of them in-viewport on mount, so lazy is a no-op. Bandwidth contention + a wide flex layout pass while the LCP is still decoding causes the staggered/jank "appearing in parts" effect.

3. **Video competes with LCP** — The autoplaying MP4 starts immediately and steals bandwidth from the Original image that should be the LCP.

## Fix

### 1. Make the Original image small and prioritized
- Move `home-hero-original-dress.jpg` to the `landing-assets` Supabase bucket (or keep import but route through `getOptimizedUrl`) and serve it through the same image transform as previews: `width: 480, height: 640, quality: 85`. Drops ~336 KB → ~40 KB.
- Add a `srcSet` (320 / 480 / 640 / 840) just like the other cards.
- Mark the Original card with `loading="eager"` and `fetchpriority="high"` directly in `MarqueeCard` (currently only based on first-in-row position, which is correct for Original — but it's bypassing the transform).

### 2. Move the LCP preload into the static HTML
- Add a real `<link rel="preload" as="image" href="…optimized url…" fetchpriority="high">` to `index.html` so the preload scanner picks it up before React boots. Remove the Helmet preload from `HomeHero` (it runs too late).
- If the URL needs a hash, prefer the Supabase CDN URL (stable) over the Vite-imported hashed asset.

### 3. Defer the video
- Wrap the video card in the existing `LazyVideo` component (already in the codebase at `src/components/ui/LazyVideo.tsx`) so the 689 KB MP4 only loads when the card scrolls into a near-viewport zone. Keeps it out of LCP contention on first paint.
- Use `preload="none"` and a poster image (a still optimized via `getOptimizedUrl`) so the card has a visual placeholder before the video mounts.

### 4. Throttle the marquee image storm
- Stop hard-doubling the cards in JSX. Instead render one set and use a CSS `translateX(-50%)` marquee that visually duplicates without doubling DOM nodes (or keep the duplicate but mark the second copy `aria-hidden` and `loading="lazy"` with `fetchpriority="low"` regardless of position).
- For the first set, only the Original (card 0) gets `eager` + `fetchpriority="high"`. Cards 1–5 get `loading="eager"` but `fetchpriority="low"` so they don't compete with the LCP.
- The duplicated half always uses `loading="lazy"` `fetchpriority="low"`.

### 5. Stabilize layout
- Already has `aspect-[3/4]` on each card — good. Double-check the marquee row container uses `contain: content` (or `content-visibility: auto` on offscreen rows) to prevent the long flex track from triggering a giant layout pass on first paint.

### 6. (Bonus) Clean up the unrelated console warning
- The `Auth` page is forwarding a ref into a `Dialog`/`DialogContent` that isn't a `forwardRef`. Out of scope for this fix but I noted it — happy to patch in the same change if you want.

## Files to touch

- `src/components/home/HomeHero.tsx` — route Original through `getOptimizedUrl`, add srcSet, swap video for `LazyVideo`, drop the Helmet preload, tag fetchpriority per card.
- `index.html` — add static `<link rel="preload" as="image" …>` for the Original (using its Supabase-CDN optimized URL).
- (Optional) Move `src/assets/home-hero-original-dress.jpg` → `landing-assets` bucket so the same transform pipeline applies. If you'd rather keep it as a bundled asset, we can keep the import but still pass it through `getOptimizedUrl` — the helper accepts any URL.

## Expected result

- Original image is ~40 KB instead of 336 KB and is the **first** card to paint, not the last.
- Video stops competing for bandwidth on first load.
- No more staggered "appearing in parts" effect; LCP improves measurably.
- Preload hint is actually honored by the browser.

Approve and I'll implement.
