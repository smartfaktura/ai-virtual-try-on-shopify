## Improve hero tile image quality

The current hero tiles render at width 480 / quality 78, which on retina screens (especially the 210px-wide tiles at 2x = 420px, 3x = 630px) is just barely covering native resolution and can look slightly soft/pixelated. I'll raise both the base resolution and the srcSet ceiling so the tiles look crisp on all displays, while keeping eager-loading + priority hints intact so the hero still renders first.

### Changes

**1. `src/components/seo/photography/PhotographyHero.tsx` — `Tile` component**
- Base `src`: bump from `width: 480, height: 640, quality: 78` → `width: 640, height: 854, quality: 85`
- `srcSet` widths: from `[320, 480, 630]` → `[360, 540, 720, 900]` (covers 1x → 4x for 210px tiles)
- `quality` in srcSet: from `78` → `85`
- Keep aspect `[3, 4]`, eager loading + `fetchpriority="high"` for the first 6 tiles unchanged.

**2. `src/components/seo/landing/LandingHeroSEO.tsx`**
- Apply the same width/quality bump to the hero tiles there for consistency (`widths: [360, 540, 720, 900]`, `quality: 85`, base width ~640).

**3. `src/components/seo/photography/category/CategoryHero.tsx`**
- Main hero image: keep `1120x1400` but raise quality `78 → 85`; widen srcSet ceiling to `[640, 900, 1120, 1400]` at quality 85.
- Collage tiles: bump base from `560x700 q78` → `640x800 q85`; srcSet widths to `[360, 540, 720, 900]` at quality 85.

### Why this fixes the pixelated look
- Retina displays render the 210px CSS tiles at up to 630 physical pixels; serving a 480-wide source forces the browser to upscale slightly. Going to 720–900w in the srcSet means the browser always has a source ≥ device pixel count.
- Quality 85 is the sweet spot for product/editorial photos (above 85 file size grows fast with little visual gain; below 80 starts showing JPEG ringing on edges and skin).

### Performance impact
Per tile JPEG goes from ~25–35 KB → ~45–60 KB. With 6 eager tiles that's ~150 KB extra over LCP — negligible on broadband, and the eager + `fetchpriority="high"` ordering still ensures the hero paints before below-the-fold content.

No new dependencies, no layout changes, no markup changes beyond the optimization parameters.