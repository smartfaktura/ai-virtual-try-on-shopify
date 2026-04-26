## Goal

Make every image on `/` look crisp and premium. Current setup uses quality `72` and tops out at moderate widths. We'll move to high-quality settings and add a true 2x variant that retina screens can actually pick.

## What changes

All edits live in two places: the homepage components and the optimization helper.

### 1. Quality bump: 72 → 85

`q=85` is the standard "visually lossless" JPEG/WebP threshold. The jump from 72 → 85 removes the residual softness in shadows, fabric textures, and skin tones. File size grows ~30–40%, but each image is still well under 250 KB at the widths below.

### 2. Bigger retina ceiling

Add a larger top-end variant per component so 2x and 3x devices download genuinely sharp pixels (not an upscaled mid-size).

| Component | Today (top width) | New (top width) | New `sizes` ceiling |
|---|---|---|---|
| `HomeHero` marquee tile | 640 | **840** | 210 CSS px tile → 2x = 420, 3x = 630 (covered) |
| `HomeTransformStrip` tile | 640 | **840** | same as hero |
| `HomeOnBrand` grid | 600 | **900** | larger grid cells need more headroom |
| `HomeCreateCards` | 960 | **1280** | feature cards rendered up to ~640 CSS px wide |
| `HomeStudioTeam` avatar | 480 (single) | **600 + srcSet [320, 480, 600]** | currently no srcSet, retina underserved |

### 3. Helper default

Bump `getResizedSrcSet` default `quality` from `72` → `85` so any future caller inherits the new standard.

### 4. Original hero photo (`originalDress` import)

This is a bundled local asset (`@/assets/...`), so it bypasses the optimizer entirely. Vite serves it as-is. No quality concern there — already a high-quality JPEG.

## Files to edit

- `src/lib/imageOptimization.ts` — bump default quality in `getResizedSrcSet` to 85
- `src/components/home/HomeHero.tsx` — quality 85, add 840 to widths
- `src/components/home/HomeTransformStrip.tsx` — quality 85, add 840 to widths (both occurrences)
- `src/components/home/HomeOnBrand.tsx` — quality 85, widths `[480, 600, 900]`
- `src/components/home/HomeCreateCards.tsx` — quality 85, widths `[640, 960, 1280]`
- `src/components/home/HomeStudioTeam.tsx` — quality 85, add `srcSet` with `[320, 480, 600]` widths

## Expected impact

- **Visual:** noticeably crisper hero marquee, transform strip, and "on brand" grid on retina screens. Skin/fabric grain replaces JPEG mush.
- **Weight per tile:** ~120 KB → ~180–200 KB at 480w q85. Acceptable for a quality-led landing page.
- **LCP:** unchanged for non-retina (they still pick the 320/480 variant). Retina users pay slightly more for a much sharper hero.

## Out of scope

- No layout, copy, or component structure changes.
- Hub pages (already addressed separately) are untouched.
- Caching: Supabase render URLs are content-addressed by query params, so the new URLs are fresh — no cache busting needed. A hard refresh isn't required, but recommended to flush already-fetched lower-q variants.
