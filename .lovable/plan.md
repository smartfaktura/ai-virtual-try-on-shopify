## Issue

On `/ai-product-photo-generator`, the second marquee row starts visually offset (not full-bleed from the left edge), creating an awkward empty starting point.

## Root cause

In `tailwind.config.ts` the marquee keyframes are:

```text
marquee-left :  translateX(0)    →  translateX(-50%)
marquee-right:  translateX(-50%) →  translateX(0)
```

Row 1 uses `marquee-left`, so it starts at `translateX(0)` — the track is flush with the left edge from the very first frame.

Row 2 uses `marquee-right`, so it **starts at `translateX(-50%)`** — the track is already shifted half-width to the left. Because `LandingHeroSEO` only repeats tiles `2×` (REPEATS = 2), shifting by 50% lands exactly at the seam between the two copies. With only 5 tiles × 210 px = 1050 px per copy, on a 1310 px viewport this leaves a visible gap on the **right** at first paint, and the row appears to "start mid-line" until the animation has advanced enough to fill the viewport.

This is purely a marquee-track sizing/looping issue — not an image-loading issue (the previous optimization is unrelated).

## Fix

Increase tile duplication so each translation phase always overflows the widest realistic viewport, and the seam at `translateX(-50%)` is never visible. Two complementary changes in `src/components/seo/landing/LandingHeroSEO.tsx`:

1. **Bump `REPEATS` from 2 → 4** in `MarqueeRow`. With 5 tiles × 210 px × 4 = 4200 px total track (2100 px per half), the row stays seamless on viewports up to ~2000 px wide regardless of starting offset.
2. **Guarantee a minimum tile count per row** before duplication. If `row2` ends up with fewer tiles than `row1` (odd total), pad it by cycling from `row1` so both rows have equal logical length and identical seam math.

Optional polish (low risk, recommended):

3. Add `will-change: transform` and `backface-visibility: hidden` to the marquee track via Tailwind utilities so the initial transform paints crisply on first frame (avoids a momentary jank when the animation registers).

## Files touched

- `src/components/seo/landing/LandingHeroSEO.tsx` — `MarqueeRow` (REPEATS bump, will-change), `LandingHeroSEO` (balance row1/row2 lengths).

No keyframe changes needed — `tailwind.config.ts` stays as-is, so every page using these animations benefits from the fix automatically.

## Verification

- `/ai-product-photo-generator` — both rows full-bleed from first paint, no gap on the right of row 2.
- `/ai-product-photography`, `/ai-photography-vs-photoshoot`, `/ai-photography-vs-studio`, `/etsy-product-photography-ai`, `/shopify-product-photography` — same hero component, confirm no regression.
- Test at 1310 px (current viewport), 1920 px, and 768 px.
