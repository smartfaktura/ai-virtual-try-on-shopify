## Goal

Make the thumbnail cards in `/app/product-swap` (Step 1 "Scene" library grid and Step 2 "Products" grid) visually match the polished card style used in `/app/generate/product-images` Step 1.

This is a presentation-only change. No data flow, selection logic, search, pagination, or generation behavior is touched.

## Reference design (from `ProductImagesStep1Products.tsx`)

Each card:
- `rounded-xl border-2 overflow-hidden` outer button
- Image area: `aspect-square` on `bg-muted`
- Caption strip: fixed `h-[52px]` with title (`text-xs font-medium`) + secondary line (`text-[10px] text-muted-foreground`)
- Selected state: `border-foreground ring-2 ring-foreground/15 shadow-md` + `CheckCircle` icon top-right
- Unselected state: `border-transparent hover:border-foreground/20`
- Uses `ShimmerImage` for the image
- Products use `object-contain` with `p-2` (cutout on muted backdrop)

Grid columns: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3`

## Changes in `src/pages/ProductSwap.tsx`

### 1. Step 1 — library scene grid (around lines 645-657)
- Replace current card markup with the reference card pattern.
- Keep `object-cover` for the image (scenes are full compositions, not cutouts) but adopt the new outer card structure (`rounded-xl border-2 overflow-hidden`, 52px caption strip).
- Caption: scene title (`text-xs font-medium truncate`) — second line left blank (`\u00A0`) so heights match the products grid.
- Selected/hover states: since library scenes are click-to-pick (not multi-select), keep a single hover treatment (`border-transparent hover:border-foreground/20`).
- Update grid to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3`.
- Swap `<img>` for `ShimmerImage`.

### 2. Step 2 — products grid (around lines 766-789)
- Replace current card markup with the reference pattern.
- Image area: `aspect-square` on `bg-muted` with `p-2` and `object-contain` (so isolated product cutouts breathe, matching `/app/generate/product-images`).
- Caption strip: `h-[52px]` — line 1 = `product.title`, line 2 = `product.product_type` (fallback `\u00A0`).
- Selected: `border-foreground ring-2 ring-foreground/15 shadow-md` + `CheckCircle` icon top-right.
- Unselected: `border-transparent hover:border-foreground/20`.
- Remove the floating `Checkbox` (top-left) — selection is conveyed by the border/ring + check icon, matching the reference.
- Update grid to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3`.
- Swap `<img>` for `ShimmerImage`.

### 3. Imports
- Add `ShimmerImage` from `@/components/ui/shimmer-image`.
- Add `CheckCircle` to the `lucide-react` import (alongside existing icons).

## Out of scope (unchanged)

- Selected-tray pill bar at the bottom of Step 2
- Search inputs, "Select visible" / "Clear" controls, pagination ("Load more")
- Scene aspect-ratio detection, upload flow, generation flow
- `useProductSwap` hook and any backend logic
- Step 3+ (generating / results) UI

## Verification

- Visit `/app/product-swap`; confirm Step 1 library tiles match the product-images card frame (border, caption strip, selected ring) while keeping scene previews full-bleed (`object-cover`).
- Advance to Step 2; confirm product tiles render as cutouts on muted bg with the 52px caption strip, foreground ring on select, `CheckCircle` top-right.
- Confirm row heights are uniform across both grids and across breakpoints (cards align even when one card has no second-line text).
