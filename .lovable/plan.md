# Shareable URLs for Product Visual Library

## Problem
On `/product-visual-library`, the URL only reads `?family=&collection=` on initial load (deep-link), but never updates when the user clicks a different family or collection. Copying the URL after navigating gives others the default view, not the tab they're seeing.

## Fix
Make selection ↔ URL fully two-way in `src/pages/ProductVisualLibrary.tsx`.

1. Switch `useSearchParams()` to use the `setSearchParams` setter as well.
2. On every selection handler (`handleSelectFamily`, `handleSelectCollection`, `handleMobileSelect`, and the "clear collection" path), update the URL:
   - Family chosen → `?family=<slug>` (drop `collection`)
   - Family + collection → `?family=<slug>&collection=<slug>`
   - Cleared back to default → remove both params
   - Use `replace: true` so each click doesn't pollute browser history.
3. Keep the existing deep-link effect for first load (already handles `?family=&collection=`), so opening a shared URL lands on the correct tab and scrolls to the grid.
4. No visual/behavior changes beyond URL syncing; no other files affected.

## QA
- Click a family → URL updates to `?family=...`.
- Click a sub-collection → URL becomes `?family=...&collection=...`.
- Copy URL, open in new tab → same tab + sub-category preselected and grid scrolled into view.
- Back/forward buttons still work (replace avoids history spam, but deep-link effect re-applies on full loads).
