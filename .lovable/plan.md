## Problem

On `/ai-product-photography/bags-accessories` (and similarly fashion), the hero collage:

1. **Wrong subjects**: "Watches" tile shows a **fashion/apparel image** (`1776664933175-rjlbn6` = Sunlit Tailoring Studio from the fashion data — a person in a coat, no watch). "Eyewear" tile is a portrait dominated by a lollipop instead of the frames.
2. **Mixed scales**: Top row = product-only still-life (bag, bottle), bottom row = full human portraits. Tiles feel disjointed because they don't share a visual scale family.
3. **Inconsistent labels**: One tile reads "BAGS" while the page already says "Bags & Accessories" — labels duplicate what the H1 already announces.

Single-category pages (footwear, beauty, jewelry, etc.) currently use one big hero image — fine, but a small visual upgrade will make all hub pages feel cohesive.

## Fix

### 1. Re-curate the multi-category hero collages with on-subject, scale-matched images

Use real, subject-focused tiles pulled from the existing `BUILT_FOR_GRIDS` catalog so every tile actually shows the named subcategory at a similar scale (mid-shot product-with-context, not full-body portraits next to still-life).

**Bags & Accessories (`bags-accessories`)** — replace current 4 tiles with:

| Tile | Image ID | Why |
|------|----------|-----|
| Bags | `1776239449949-ygljai` (Sculptural Bag Studio Hero) | keep — proper bag still-life |
| Backpacks | `1776231546156-0g25eq` (One Shoulder Carry) | swap "Accessories" → real backpack tile |
| Eyewear | `1776102186144-xrnwnc` (Handheld Frame) or `1776102198082-xi72z6` (Sleek Black) | frames are the hero, not a lollipop |
| Watches | `1776856607319-693vtg` (Earthy Glow Stage) | actual watch editorial — fixes the wrong-image bug |

**Fashion (`fashion`)** — keep concept but verify each tile is on-subject:

| Tile | Image ID |
|------|----------|
| Apparel | `1776664933175-rjlbn6` (Sunlit Tailoring Studio) |
| Activewear | `1776192312181-3v0u0t` (Editorial Floor Stretch) |
| Swimwear | `1776246297359-aecrip` (Resort Editorial Hero) — replace current swimwear ID with a cleaner, more on-brand tile |
| Jackets | `1776691912818-yiu2uq` (Sunlit Tailored Chair Pose) |

### 2. Improve collage layout for visual cohesion

In `CategoryHero.tsx`:

- Tighten gutter (`gap-1.5` → `gap-2`) and inner padding (`p-1.5` → `p-2`) for a more balanced grid.
- Replace the heavy bottom-gradient + uppercase chip with a **subtle bottom-left chip** (rounded pill, frosted background, no gradient overlay) so the imagery breathes. Removes the "one tile is dark, another is bright" feel caused by the full-width gradient on light shots.
- Slightly bump tile corner radius (`rounded-2xl` → `rounded-xl`) for a more editorial, less "card-stack" look.
- Outer container shadow softened to match the rest of the page surface.

### 3. Single-category hero — small polish

- Add a thin overlay-free corner chip (same component as collage) instead of the full gradient bar so the hero photo breathes consistently with the collage variant.

## Files

- `src/data/aiProductPhotographyCategoryPages.ts` — update `heroCollage` for `fashion` and `bags-accessories` with the new image IDs + alts.
- `src/components/seo/photography/category/CategoryHero.tsx` — refine collage gutters, replace gradient label with frosted chip, soften shadows, apply chip to single-image variant.

No new dependencies, no schema changes.