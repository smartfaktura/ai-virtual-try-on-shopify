## Two issues on `/home`

### Issue A — "From one photo to a full shoot" missing on desktop (regression)
After the recent mobile-carousel change, the desktop layout is invisible.

**Root cause** (`src/components/home/HomeHowItWorks.tsx`):
The `useScrollReveal` `ref` was attached **only to the mobile wrapper** (`<div className="lg:hidden ..." ref={ref}>`). On desktop that node has `display:none`, so its `IntersectionObserver` never fires, `visible` stays `false`, and the desktop `<div className="hidden lg:flex ...">` is stuck at `opacity-0 translate-y-6`. Result: header + CTA visible, big empty whitespace where the 3 step cards should be.

**Fix**: hoist the `ref` to a wrapper that exists in both breakpoints (the inner `max-w-[1400px]` container), and remove `ref={ref}` from the mobile-only wrapper. Both blocks then read the same `visible` flag.

### Issue B — oversized images on `/home` (slow LCP / scroll-in)
Every home component using `getOptimizedUrl(src, { quality: 60 })` is fetching the **full original resolution** because no `width` is provided. The Supabase render endpoint then sends e.g. 1500–2000px JPGs into 180–320px slots, blowing up payload and decode time.

Per the project's `image-optimization-no-crop` rule, we only add `width` where the image lives in a fixed-aspect box with `object-cover` (so server-side cropping is desired and matches the rendered frame). All home page images do — they're cards in `aspect-[3/4]`, `aspect-[4/5]`, or fixed pixel widths. Background/full-bleed images are not touched.

**Fixes** (mobile-DPR-aware widths × matching height for clean crop):

| File | Card size | New params |
|---|---|---|
| `HomeHero.tsx` (marquee cards) | 180–210px wide, 3:4 | `{ width: 320, height: 426, quality: 55, resize: 'cover' }` |
| `HomeTransformStrip.tsx` (category grid) | 6-col grid ≈ 200px wide, 3:4 | `{ width: 320, height: 426, quality: 60, resize: 'cover' }` |
| `HomeOnBrand.tsx` (consistent set) | 2-col grid ≈ 240px wide, 3:4 | `{ width: 360, height: 480, quality: 60, resize: 'cover' }` |
| `HomeCreateCards.tsx` (4-up) | ≈ 320px wide, 4:5 | `{ width: 480, height: 600, quality: 60, resize: 'cover' }` |
| `HomeStudioTeam.tsx` (avatars, also `<video poster>`) | 180–220px, 4:5 | `{ width: 320, height: 400, quality: 55, resize: 'cover' }` |

Also: in `HomeHero.tsx` the in-view preload `<link>` warming inside `HomeTransformStrip.tsx` already mirrors the same URL — once the optimized URL changes, that preload will match (no separate change needed beyond passing the same opts).

**Memory update**: bump `mem://style/image-optimization-no-crop` with a clarifying note that fixed-aspect card grids on `/home` are safe to size, and only true full-bleed/background imagery must remain `quality`-only.

## Out of scope
- No content/copy changes
- No video changes (videos already use `preload="metadata"` + `LazyVideo`)
- No layout/UX redesign of "How it works" — restoring the desktop render is the only structural fix
