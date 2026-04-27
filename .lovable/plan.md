# Optimize scene grid + chip rail images on hub pages — premium quality

Add responsive `srcSet` to the two image sections that currently download a single image regardless of tile size, while bumping quality and target widths so tiles stay crisp on retina screens for a premium feel. Zero visual/layout change — just sharper, lighter images.

## Files to change

1. **`src/components/seo/photography/category/CategorySceneExamples.tsx`** — 4-column scene grid
2. **`src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`** — chip rail tiles
3. **`src/components/seo/photography/PhotographySceneExamples.tsx`** — parent hub 5-column grid

## What changes

For each tile, swap the single `getOptimizedUrl(..., { quality: 55–60 })` for a paired `src` + `srcSet` + `sizes` using the existing `getResizedSrcSet` helper (resizes safely, no crop-zoom).

### CategorySceneExamples (4-col on lg, ~320px tile @ 1310px viewport)
- `widths: [480, 720, 960, 1200]` (covers retina 2x for 600px tiles)
- `sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 340px"`
- aspect `[3, 4]`, **quality `82`**

### PhotographySceneExamples (5-col on lg, ~260px tile)
- `widths: [400, 600, 800, 1000]`
- `sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px"`
- aspect `[3, 4]`, **quality `82`**

### CategoryBuiltForEveryCategory (chip rail tiles)
- `widths: [320, 480, 640]`
- `sizes="(max-width: 1024px) 40vw, 240px"`
- aspect `[3, 4]`, **quality `80`**

## Why these numbers (premium vibe)

- **Quality 80–82** matches the hero (which uses 85) — visibly sharp, no JPEG mush, still ~30–40% smaller than full-resolution source.
- **Widths go up to 1200/1000/640** so retina laptops/phones get a true 2x image — no soft edges on Mac displays.
- Mobile still gets small files (480/400/320), so phones save bandwidth.
- Net result vs today: similar or slightly larger payload on retina desktop (where it now looks sharper), meaningful savings on mobile, and a consistent premium look across the page.

## Technical notes

- `SmartImage` already accepts `srcSet` + `sizes` — no component changes.
- `PhotographySceneExamples` uses raw `<img>` — add `srcSet` + `sizes` attributes directly.
- Hero, related categories, and other sections already retina-grade — untouched.

## Out of scope

- No layout, design, or copy changes
- No backend changes
- Hero imagery untouched