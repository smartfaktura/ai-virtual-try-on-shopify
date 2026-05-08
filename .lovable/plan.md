## Problem

On mobile (no-hover devices), the Library card shows a persistent top action row with a status pill + favorite heart at `top-right`. The `4K` / `2K` resolution badge is also pinned to `top-right`, so it sits directly under (and bleeds through) the heart button and status pill on upscaled assets.

## Fix

In `src/components/app/LibraryImageCard.tsx`:

1. Move the resolution badge (`4K` / `2K`) from `top-3 right-3` to `bottom-3 right-3` so it never collides with the top action row on touch devices.
2. Ensure it sits above the bottom hover gradient (`z-10` already set) and is hidden in `selectMode` (already the case).
3. Keep the existing styling (primary pill, bold, shadow) — purely a position change.

No business-logic, data, or other UI changes.

## Verification

- Mobile viewport (440px): on an upscaled asset, heart + status pill render cleanly at top-right; `4K` badge sits at bottom-right, clear of the date/download row in the hover overlay (overlay is desktop-only so no conflict).
- Desktop hover: badge visible at bottom-right and does not overlap the download button (download is on the right inside the hover gradient — we'll left-align the badge if needed; if conflict observed, move badge to `bottom-3 left-3` instead).
