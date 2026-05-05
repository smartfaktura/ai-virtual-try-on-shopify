
## Problem

The `/ai-product-photography` page loads slowly because:

1. **Bulk image preloader saturates bandwidth** — `useSeoVisualOverrides.ts` lines 99-111 preload ALL override images (25+ full-resolution URLs) the moment data lands, competing with the hero tiles the user actually sees first.

2. **Hero tile images are oversized** — Tiles render at 180-210px CSS width but request `width: 640` for `src` and up to `900w` in `srcSet`. At 2x DPR that's still only 420px needed, not 900px.

## Changes

### 1. `src/hooks/useSeoVisualOverrides.ts`
- Remove the `useEffect` block (lines 99-111) that bulk-preloads every override image at full resolution. This single change eliminates 25+ concurrent image fetches that block the hero.
- Remove the unused `useEffect` import if no longer needed.

### 2. `src/components/seo/photography/PhotographyHero.tsx`
- Reduce `src` fallback from `width: 640, height: 854` to `width: 420, height: 560` (matches 210px tile at 2x).
- Reduce `srcSet` widths from `[360, 540, 720, 900]` to `[360, 420]` — only two sizes needed for the 180/210px tile.
- Reduce preload URL from `width: 540, height: 720` to `width: 420, height: 560`.

These changes cut per-image payload roughly in half and eliminate bandwidth contention from bulk preloading.
