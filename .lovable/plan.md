## Goal

Add a third pill — **Eyewear** — to the "From one product photo to every asset you need" section, alongside Swimwear and Fragrance.

---

## Scenes (all confirmed in `product_image_scenes` with previews ready)

| Label | scene_id | Preview file |
|---|---|---|
| Candy Flash | `candy-flash-portrait-eyewear` | `1776102176417-iih747.jpg` |
| Stair Selfie | `concrete-stair-selfie-eyewear` | `concrete-stair-selfie-eyewear-1776149876284.jpg` |
| Beauty Closeup | `beauty-closeup-oversized-eyewear` | `beauty-closeup-oversized-eyewear-1776150210659.jpg` |
| Golden Hour | `golden-hour-aesthetic-eyewear` | `1776102185057-0ulf1m.jpg` |
| Office Flash | `editorial-office-flash-eyewear` | `editorial-office-flash-eyewear-1776150153576.jpg` |
| Lounge Selfie | `interior-lounge-selfie-eyewear` | `1776102190563-dioke2.jpg` |
| Bench Side | `steel-bench-side-portrait-eyewear` | `1776102172131-vq969w.jpg` |
| Sunset Drive | `sunset-drive-eyewear` | `1776102204479-9rlc0n.jpg` |
| Dessert Table | `retro-dessert-table-eyewear` | `1776102181320-jisnae.jpg` |
| Flash Candy | `vintage-flash-candy-closeup` | `1776102183733-g1twvv.jpg` |

That's 10 scenes + 1 Original + 1 extra (`Beauty Closeup II` from `aesthetic-beauty-closeup-eyewear`) = 12 cards, matching the existing Swimwear/Fragrance grid (mobile shows first 9, desktop shows all 12 in 6×2).

---

## "Original" tile — uploaded image issue

The red cat-eye glasses image you uploaded (`image-7.png`) lives in the `user-uploads://` virtual namespace. Plan-mode tooling can read it but cannot copy it into `src/assets/` — that requires the `code--copy` action which only runs in build mode. **Implementation step will copy the upload to `src/assets/home-hero-original-eyewear.png`** and import it the same way the fragrance hero is imported.

If for any reason the copy step fails, fallback is the eyewear front-view packshot preview (`front-view-hats-eyewear`) so the grid is never broken.

---

## Code changes

`src/components/home/HomeTransformStrip.tsx`:

1. Add import:
   ```ts
   import originalEyewear from '@/assets/home-hero-original-eyewear.png';
   ```
2. Add a third array `EYEWEAR_CARDS` (12 entries — Original + 10 named scenes + 1 secondary closeup) following the same shape as `FRAGRANCE_CARDS`.
3. Append the third entry to `CATEGORIES`:
   ```ts
   { id: 'eyewear', label: 'Eyewear', cards: EYEWEAR_CARDS, copy: 'See what your eyewear can become.' },
   ```

Pill switcher, grid, mobile-hide rule (`i >= 9` hides last 3 on small screens) all already work generically — no UI changes needed.

---

## Files touched
- copy `user-uploads://image-7.png` → `src/assets/home-hero-original-eyewear.png`
- edit `src/components/home/HomeTransformStrip.tsx`
