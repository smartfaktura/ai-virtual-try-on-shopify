# Why /ai-product-photo-generator loads images slowly

The page renders **~50 Supabase-hosted preview JPGs** across 5 image-heavy sections (hero marquee, OneToMany showcase, CategoryGrid, plus 2 ValueCards), and the way they're requested is the bottleneck.

## Diagnosis

1. **Hero marquee fetches each tile 4×.** `LandingHeroSEO` wraps each row in `MarqueeRow` with `REPEATS = 4`. With 10 hero tiles split into 2 rows of 5, that becomes **40 `<img>` tags** in the hero alone. Even with HTTP cache they all fight for the same connection on first paint and clog the network queue ahead of the LCP image.
2. **Showcase + Category images request giant files.**  
   - `LandingOneToManyShowcase` calls `getOptimizedUrl(src, { quality: 60 })` with **no width/height**, so Supabase returns the **full-resolution** original (~1MB+ each) for tiles that render at ~150 px wide. There are 18 of them.  
   - `LandingCategoryGrid` does the same — 30 thumbs (10 categories × 3) all requested full-size.  
   - That's roughly **48 oversized images** × ~800KB–1.5MB each.
3. **No `<link rel="preconnect">`** to the Supabase storage origin, so every image pays the full TLS+DNS cost on first request.
4. **No LCP hint.** The hero CTA + headline render fast, but the first marquee image (the visual LCP candidate) has no `fetchpriority="high"` preload and competes with 39 siblings.
5. **Marquee starts `eager` for the entire first row** (5 tiles) plus 4× repetitions visible on init — meaning ~20 eager requests before lazy ones even queue.

## Plan — fixes

### 1. Stop sending oversized originals
- `LandingOneToManyShowcase`: switch each thumb to `getResizedSrcSet` with `aspect: [1,1]`, widths `[200, 300, 400]`, plus `sizes="(max-width: 1024px) 33vw, 130px"` and a properly sized `src` (`width: 300, height: 300, resize: 'cover'`).
- `LandingCategoryGrid`: same treatment — thumbs are ~150 px wide on desktop, so use widths `[200, 300, 400]`, `aspect: [1,1]`, and `sizes="(max-width: 640px) 40vw, 160px"`.

### 2. Reduce hero marquee weight
- Lower `REPEATS` from `4` → `2` (still wider than any 1310 px viewport with 5 tiles × 210 px = 1050 px → 2 copies = 2100 px, plenty).
- Keep `eager` only on the **first 2** tiles of row 1 (current LCP candidates) instead of the whole first 5.
- Drop hero `quality` from 85 → 78 — visually identical at 210 px wide, ~25% smaller payload.

### 3. Preconnect to Supabase storage
- Add `<link rel="preconnect" href="https://azwiljtrbtaupofwmpzb.supabase.co" crossorigin>` and a matching `dns-prefetch` to `index.html`. This shaves 100–300 ms off the first image.

### 4. Preload the LCP image
- In `LandingHeroSEO`, render a `<link rel="preload" as="image" imagesrcset=... imagesizes=... fetchpriority="high">` for the very first hero tile via a small effect or inline `<head>` injection. Optional but high-impact.

### 5. Sanity pass
- Confirm all `<img>` tags on the page have `loading="lazy"` except the first 2 hero tiles, and `decoding="async"` everywhere (already true).
- Verify `getOptimizedUrl` with both `width` and `height` returns properly resized URLs (per the existing `mem://style/image-optimization-no-crop` rule — already followed in hero, just not in showcase/grid).

## Files to edit
- `src/components/seo/landing/LandingOneToManyShowcase.tsx` — add sized srcSet + sizes
- `src/components/seo/landing/LandingCategoryGrid.tsx` — add sized srcSet + sizes
- `src/components/seo/landing/LandingHeroSEO.tsx` — `REPEATS=2`, narrower `eager` window, quality 78
- `index.html` — preconnect + dns-prefetch to the Supabase storage origin

## Expected impact
- First-load image bytes: roughly **~40 MB → ~3–4 MB** on this page.
- Hero LCP: noticeably faster (preconnect + fewer competing requests + high-priority first tile).
- No visual change at any breakpoint.
