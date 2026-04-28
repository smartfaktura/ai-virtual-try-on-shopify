# Fix image loading order on /ai-product-photography

## Problem

On `/ai-product-photography` the page paints out of order — Categories (Fashion / Footwear / Beauty…) and other lower sections appear filled in before the hero marquee finishes. Cause:

1. **Hero marquee duplicates every tile** (`[...tiles, ...tiles]` x 2 rows = ~24 `<img>` requests) and only the first 6 are marked `eager` + `fetchpriority=high`. The rest are `lazy`, but because the marquee scroller is `w-max` and overflows, the browser still considers many off-screen tiles "in viewport" on a 1203px display and starts loading them at low priority, fighting the eager 6.
2. **All other sections** (`PhotographyCategoryChooser`, `PhotographyVisualSystem`, `PhotographySceneExamples`, `HomeModels`) use plain `loading="lazy"` with **no `fetchpriority`**, so Chrome treats them at default priority. When their `<img>` tags exist far below the fold, they still get queued early because `lazy` only delays based on viewport distance heuristics — many fire as soon as they enter the ~1250px lookahead window, which on a tall page happens during initial layout.
3. There's **no explicit priority hierarchy**: hero (high) → categories (auto, on scroll) → visual system / scene examples / models (low, on scroll). Right now everything below hero competes equally.

## Fix

### 1. Hero — guarantee the first paint wins
- Reduce eager tiles from 6 to **4** (only the visible ones at 1200px viewport — roughly 4 fit before the right edge) and keep `fetchpriority="high"` on those.
- Mark the **second row entirely `loading="lazy"` + `fetchpriority="low"`** since it only matters once the user scrolls a few pixels.
- Add `<link rel="preload" as="image" href={firstTileSrc} fetchpriority="high">` for the very first tile via a small `<Helmet>` in `PhotographyHero` so the browser starts the request before React hydrates.

### 2. Below-the-fold sections — explicitly deprioritize
Add `fetchpriority="low"` (and keep `loading="lazy"`) to every `<img>` in:
- `PhotographyCategoryChooser.tsx` (30 thumbs)
- `PhotographyVisualSystem.tsx` (18 thumbs)
- `PhotographySceneExamples.tsx` (10 tiles)
- `HomeModels.tsx` model thumbnails (only the ones rendered on this page)

This tells Chrome: "do not race the hero." Combined with `lazy`, they will only kick in once they actually approach the viewport, and at low TCP/HTTP priority so the hero finishes first.

### 3. Smaller initial payload for category thumbs
`PhotographyCategoryChooser` currently asks for `width: 300, quality: 70` per thumb but renders at ~160px. Drop default request to `width: 200, quality: 65` so the initial bytes per thumb shrink by ~40%, freeing bandwidth for the hero.

### 4. Defer `HomeModels` images
`HomeModels` renders dozens of model headshots and is the 4th section on the page. Wrap its image grid render in an `IntersectionObserver` (reuse `useScrollReveal` from `src/hooks/useScrollReveal.ts`) so the `<img>` tags only mount once the section is ~400px from viewport. This removes ~40+ image requests from the initial waterfall entirely.

## Files to edit

```text
src/components/seo/photography/PhotographyHero.tsx           // eager=4, second row low priority, preload first tile
src/components/seo/photography/PhotographyCategoryChooser.tsx // fetchpriority=low, smaller default width
src/components/seo/photography/PhotographyVisualSystem.tsx   // fetchpriority=low
src/components/seo/photography/PhotographySceneExamples.tsx  // fetchpriority=low
src/components/home/HomeModels.tsx                           // gate image grid with useScrollReveal
```

## Expected result

Loading order on a fresh load becomes deterministic:
1. Hero copy + first 4 tiles render almost immediately (preload + high priority)
2. Remaining hero tiles fill in
3. Categories thumbs load as user scrolls past hero
4. Visual System → Scene Examples → Models load in scroll order

No layout reshuffling, no "footer/categories appearing before hero" flash.
