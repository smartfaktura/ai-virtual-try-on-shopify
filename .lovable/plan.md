## Problem

Hub page hero banners (`/ai-product-photography`, its `<category>` sub-pages, and the `LandingHeroSEO`-based pages: `/shopify-product-photography-ai`, `/etsy-product-photography-ai`, `/ai-product-photo-generator`, `/ai-photography-vs-photoshoot`, `/ai-photography-vs-studio`) load slowly and "pop in" tile-by-tile after the rest of the page is already visible.

## Root cause

Per `mem://style/image-optimization-no-crop`, calling `getOptimizedUrl(url, { quality: 60 })` **without `width`** returns the **original full-size image** (typically 1.5–3 MB per tile). Three hero variants do this:

1. `src/components/seo/photography/PhotographyHero.tsx` — every tile is full-resolution AND `loading="lazy"`, so even the visible-on-load tiles are deferred.
2. `src/components/seo/landing/LandingHeroSEO.tsx` — same `quality: 60` no-width call. Has eager + high-priority hints on the first tiles, but they're huge so priority can't save them.
3. `src/components/seo/photography/category/CategoryHero.tsx` — `SmartImage` calls also pass `quality: 60` with no width.

Result: the hero hammers the network with multi-MB images while smaller below-the-fold images (which use proper `width+height`) finish first → the hero appears last, exactly opposite of what you want.

## Fix — load hero first, with retina-grade quality

Apply the homepage standard (`width + height + resize: 'cover'` + retina `srcSet`) but at **higher resolution** than a typical thumbnail to keep the hero crisp on big/retina displays. Combine with eager loading and high fetch priority on the first row so the browser prioritizes the hero above lazy below-the-fold sections.

Tile rendered size on screen: `180px` mobile / `210px` desktop wide × `aspect-[3/4]`. To stay sharp at 2×–3× device pixel ratios we serve up to **630 px wide** and offer the browser smaller variants for low-DPR/mobile.

### File 1: `src/components/seo/photography/PhotographyHero.tsx`

- Import `getResizedSrcSet` alongside `getOptimizedUrl`.
- `Tile`:
  - `src` → `getOptimizedUrl(src, { width: 480, height: 640, quality: 78, resize: 'cover' })`
  - `srcSet` → `getResizedSrcSet(src, { widths: [320, 480, 630], aspect: [3, 4], quality: 78 })`
  - `sizes="(max-width: 640px) 180px, 210px"`
  - Explicit `width={210} height={280}` to reserve layout space.
  - New `eager` prop. When `eager`: `loading="eager"`, `fetchpriority="high"`. Otherwise `loading="lazy"`, `fetchpriority="auto"`.
- `MarqueeRow` accepts `eagerFirst`; passes `eager={eagerFirst && i < 6}` to the first six tiles of the duplicated track (the ones actually visible on first paint of row 1).
- Render row 1 with `<MarqueeRow … eagerFirst />`; row 2 stays lazy.

### File 2: `src/components/seo/landing/LandingHeroSEO.tsx`

- Import `getResizedSrcSet`.
- `Tile` already accepts `eager` + `highPriority` — only the URL building changes:
  - `src` → `getOptimizedUrl(resolvedSrc, { width: 480, height: 640, quality: 78, resize: 'cover' })`
  - `srcSet` → `getResizedSrcSet(resolvedSrc, { widths: [320, 480, 630], aspect: [3, 4], quality: 78 })`
  - `sizes="(max-width: 640px) 180px, 210px"`
- No prop signature changes — row 1 is already wired with eager + first-two high-priority.

### File 3: `src/components/seo/photography/category/CategoryHero.tsx`

Both `<SmartImage>` call sites:

- **Big single hero** (`heroMainSrc`, container is `aspect-[4/5]` mobile / `lg:aspect-[5/6]`, ~560 px CSS wide on lg):
  - `src` → `getOptimizedUrl(heroMainSrc, { width: 1120, height: 1400, quality: 80, resize: 'cover' })`
  - `srcSet` → `getResizedSrcSet(heroMainSrc, { widths: [560, 840, 1120], aspect: [4, 5], quality: 80 })`
  - `sizes="(max-width: 1024px) 92vw, 560px"`
  - `priority` already true → SmartImage emits `loading="eager"` + `fetchpriority="high"`.
- **Collage tiles** (`HeroTile`, ~280 px CSS wide max):
  - `src` → `getOptimizedUrl(src, { width: 560, height: 700, quality: 78, resize: 'cover' })`
  - `srcSet` → `getResizedSrcSet(src, { widths: [320, 480, 640], aspect: [4, 5], quality: 78 })`
  - `sizes="(max-width: 1024px) 45vw, 280px"`
  - Tile #1 keeps `priority`. Add `priority` to tile #2 as well so both above-the-fold collage tiles load first.

### Result

- Tile payload drops from ~1.5–3 MB → ~80–180 KB at retina, with no perceptible quality loss (q78–80, sized 2.5–3× the CSS pixels).
- Eager + `fetchpriority="high"` on the first row means the browser starts and finishes hero requests **before** the lazy below-the-fold sections — the hero now renders first.
- Layout is reserved with explicit `width`/`height`, so no late layout shift when tiles arrive.

## Out of scope

- Below-the-fold sections (already optimized).
- Marquee animation, copy, layout.
- Standalone `/` homepage `HomeHero` / `HomeTransformStrip` (already on the new standard).
