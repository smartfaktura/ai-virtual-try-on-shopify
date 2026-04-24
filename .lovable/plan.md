## Goal
Strip the "From one product photo…" section header down to minimal, breathable copy. Remove subtitle and per-pill italic line. Shorten pill labels.

## Changes — `src/components/home/HomeTransformStrip.tsx`

**Header block** — replace current 3 stacked text elements (h2 + long subtitle + italic per-pill copy) with just:

- Tiny eyebrow: `ONE PHOTO · EVERY SHOT` (uppercase, tracked, muted)
- H2: `Built for every category.`

That's it. No paragraph subtitle. No per-pill italic line. The grid + pills speak for themselves.

**Pills** — shorten labels to single words / tight phrasing so the bar reads cleanly on one line on desktop:

- `'35+ Categories · 1000+ Scenes'` → `'All categories'`
- Keep `Swimwear`, `Fragrance`, `Eyewear` as-is.

The full "35+ categories · 1000+ scenes" line moves under the grid as a small muted caption (replacing the current location of nothing — between grid and CTA), e.g. `35+ categories · 1000+ scenes · one upload`.

**Remove the `copy` field usage** entirely from the render (still keep on the data type to avoid breaking, or drop it — drop it for cleanliness).

## Files
- edit `src/components/home/HomeTransformStrip.tsx` only
