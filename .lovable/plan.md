# Fix: Models section crashed (single tile instead of two scrolling rows)

## What's wrong

On the homepage `Choose a model or create your own.` section, only the single "Brand Models" CTA tile is visible. The two opposite-direction scrolling marquee rows of model cards have collapsed to zero width.

## Root cause

Commit `1fda5a002` (Apr 26) refactored `src/components/landing/ModelShowcaseSection.tsx` to make tiles work inside the **mobile grid** by adding `w-full` to the card wrapper and changing the inner thumbnail to `aspect-[3/4] w-full`.

That works for the mobile `<div className="grid grid-cols-3">` (where each grid cell defines an explicit width). But the **desktop marquee row** is:

```
<div className="flex gap-3" style={{ width: 'max-content' }}>
  <Link className="... flex-shrink-0 w-full"> ... </Link>   ← w-full = 0
</div>
```

`width: max-content` sizes the parent to its children, while `w-full` on a child resolves to `100%` of the parent's content width. That's a circular dependency: the browser falls back to a 0-width child. The `aspect-[3/4]` then computes height from width=0, so every tile collapses to nothing. Only the CTA shows a sliver because of intrinsic content padding.

## Fix

Decouple desktop marquee sizing from mobile grid sizing. Restore intrinsic card widths on desktop while keeping the mobile grid working.

### Change 1 — `src/components/landing/ModelShowcaseSection.tsx`

In `BrandModelCTA` and `ModelCardItem`:

- Remove `w-full` from the outer wrapper `<Link>` / `<div>`.
- Remove `aspect-[3/4] w-full` from the inner thumbnail and restore an explicit mobile width.
- Inner card: `w-24 h-32 sm:w-32 sm:h-40 lg:w-36 lg:h-44` (the pre-regression sizing).
- Keep `truncate max-w-full` on the name span and keep the `sizes` attribute as is — those are fine.

This restores intrinsic 96/128/144 px tile widths everywhere. The mobile `grid-cols-3` cell is wider than 96 px on phones, so tiles still center and look correct in the mobile grid; if needed we can add `mx-auto` on the wrapper for perfect centering inside grid cells.

### Change 2 — verify mobile grid still looks right

Mobile grid cell width at 375 px viewport ≈ (375 − 32 padding − 24 gaps) / 3 ≈ 106 px, and the card is 96 px → tiles sit slightly left-aligned. Add `items-center` (already present) + `w-24` is fine. If we want the tile to fill the grid cell on mobile only, use `w-full sm:w-32 lg:w-36` on the **inner** card and keep the wrapper intrinsic — but only when rendered inside the grid. Cleaner option: keep fixed `w-24 sm:w-32 lg:w-36` everywhere; the mobile grid still looks balanced.

## Technical notes

- Files touched: `src/components/landing/ModelShowcaseSection.tsx` only.
- No data, RLS, or backend changes — `mockModels`, `useModelSortOrder`, and the `model_sort_order` query are all healthy.
- No CSS keyframe changes — `marquee-left` / `marquee-right` keyframes in `src/index.css` are intact.
- Affects every place that renders `ModelsMarquee` (home, SEO landing pages) — they will all return to two opposite-scrolling rows of model thumbnails with the CTA card interleaved.

## Verification after build

- Desktop (≥1024 px): two rows of ~144×176 tiles scrolling in opposite directions, CTA interleaved every 6 cards.
- Tablet (640–1023 px): 128×160 tiles.
- Mobile (<640 px): 3-column grid with 96×128 tiles, CTA in position 3.
