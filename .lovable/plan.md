## Fix slow image loading on Shopify SEO page + 3 CTA destination tweaks

### Part A — Why `/shopify-product-photography-ai` (and the Etsy twin) loads slowly

The hero marquee is the bottleneck. `LandingHeroSEO` renders **10 unique tiles repeated 4× across 2 marquee rows = 80 `<img>` elements**, each with a 3-width `srcSet`. Combined with the rest of the page (`LandingOneToManyShowcase` 6×3 = 18 imgs, `LandingCategoryGrid` 6×3 = 18 imgs, value cards' icons, footer), the page issues **~120 image requests**, far exceeding browser per-origin connection limits (~6). The result: long waterfalls and visibly slow first paint of the hero.

Three compounding issues:

1. **Over-repeated marquee track** — `REPEATS = 4` was sized to fill ultra-wide viewports with only 5 tiles per row. With 5 tiles × 210px × 4 repeats = 4200px per row, but the comment says half the track must overflow the viewport. We can drop to `REPEATS = 2` for tile sets ≥ 5 (still 2100px per half, more than enough for 2000px viewports — math from the existing comment confirms this).
2. **Eager fetch + fetchPriority='high' on multiple tiles** — currently the first image of each repeat block (so multiple per row) is eager. Should be exactly one image fetch-prioritized (the first visible LCP candidate).
3. **`srcSet` on tiny 180–210px CSS-pixel tiles** — the marquee tiles are fixed-width carousel cells that never grow past 210px. A 3-width srcSet (360/540/720) generates extra DPR-2 fetches for marginal quality gains. For a thumbnail this small, a single optimized URL is plenty (still retina-crisp via Supabase resize).

### Fixes in `src/components/seo/landing/LandingHeroSEO.tsx`

**1. Reduce marquee repeats**
```ts
// before
const REPEATS = 4;
// after — 2 is enough for any tile set with >=5 unique tiles
const REPEATS = tiles.length >= 5 ? 2 : 4;
```
Cuts hero `<img>` count from **80 → 40** (or fewer when tiles >= 10).

**2. Drop the 3-width srcSet on marquee tiles (fixed-size thumbnails)**
Replace:
```tsx
src={getOptimizedUrl(resolvedSrc, { width: 540, height: 720, quality: 78, resize: 'cover' })}
srcSet={getResizedSrcSet(resolvedSrc, { widths: [360, 540, 720], aspect: [3, 4], quality: 78 })}
sizes="(max-width: 640px) 180px, 210px"
```
with a single URL sized for retina (420×560 covers both 180px and 210px @ 2× DPR):
```tsx
src={getOptimizedUrl(resolvedSrc, { width: 420, height: 560, quality: 72, resize: 'cover' })}
```
Removes ~80 extra DPR-2 candidate URLs the browser was evaluating.

**3. Limit eager loading to a single LCP-priority image**
Currently `eager && i < 2` and `highPriority && i < 1` apply to **each repeat slot** (so up to 2 eagers per row across 4 repeats = 4 eager fetches). Tighten so only the very first tile of row 1 is eager + high priority; everything else lazy.
```tsx
// in MarqueeRow
eager={eager && i === 0}
highPriority={eager && i === 0}
```

**4. Add `fetchpriority="low"` to all lazy tiles**
This deprioritizes the 70+ marquee dupes against above-the-fold UI fetches.

### Part B — CTA destination changes

**1. `src/pages/seo/ShopifyProductPhotography.tsx` (line 80)**
```ts
secondaryCta={{ label: 'See examples', to: '/ai-product-photography' }}
// →
secondaryCta={{ label: 'See examples', to: '/discover' }}
```

**2. `src/pages/seo/EtsyProductPhotography.tsx` (line 80)**
Same change: `to: '/ai-product-photography'` → `to: '/discover'`.

**3. `src/components/seo/photography/category/CategoryHero.tsx` (lines 70–75)**
The "See examples" anchor on `/ai-product-photography/fashion` already points to `#scene-library`, which is the wrong section. The "Built for every fashion shot." headline lives in `CategoryBuiltForEveryCategory.tsx` (line 89). Add an `id="built-for-every"` to that section's outer `<section>` element and update the hero anchor:
```tsx
href="#scene-library"  →  href="#built-for-every"
```

Need to also add `scroll-mt-24` (matching `CategorySceneExamples`) to that section so the sticky nav doesn't cover the heading.

### What stays
- All page copy, layouts, JSON-LD, FAQs, hero collage tile counts.
- The override hook (`useSeoVisualOverridesMap`) — it's already cached.
- `LandingOneToManyShowcase` + `LandingCategoryGrid` (their imgs are already lazy and properly sized for their containers).

### Out of scope
- No backend / data changes.
- No design changes to the hero or category pages — purely image-loading tuning + CTA hrefs.
- Not touching `getResizedSrcSet` (still correct for full-bleed cards elsewhere).

### Files touched
- `src/components/seo/landing/LandingHeroSEO.tsx` — marquee perf
- `src/pages/seo/ShopifyProductPhotography.tsx` — CTA href
- `src/pages/seo/EtsyProductPhotography.tsx` — CTA href
- `src/components/seo/photography/category/CategoryHero.tsx` — anchor target
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — add `id="built-for-every"` + `scroll-mt-24`

### Expected impact
Hero image count drops from 80 → ~40 with srcSet candidates removed, so total image fetches across the Shopify page drop roughly **~40-50%**. First contentful paint of the hero marquee should be visibly faster, especially on slower connections.
