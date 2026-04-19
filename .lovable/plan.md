

## Issues confirmed

### Issue 1 — Horizontal scrollbar at bottom of modal
The sticky footer in `ManualProductTab.tsx` (line 1259) uses `-mx-5 sm:-mx-7` negative margins to bleed the white footer background to the drawer edges. But the scroll container in `AddProductModal.tsx` (line 286: `<div className="px-7 pb-7 flex flex-col flex-1 min-h-0">`) has **no `overflow-x-hidden`**. The negative-margin overflow triggers a stray horizontal scrollbar (visible in the screenshot as the gray bar above "Switch method").

### Issue 2 — "Strange container and line" after Product Details
What looks like a stray line is actually two stacked things:
1. The horizontal scrollbar from Issue 1.
2. The collapsed **"More Details (optional)"** Collapsible card right below it (line 1216) — rendered as its own bordered card even when closed. With nothing inside, it reads as an awkward empty container.

## Fix (2 small edits)

### Fix A — Kill the horizontal scrollbar
In `src/components/app/AddProductModal.tsx`, add `overflow-x-hidden` to the desktop sheet body wrapper (line 286) and the mobile drawer wrapper (line 251). This contains the sticky footer's negative-margin bleed without affecting vertical scroll.

### Fix B — Make the collapsed "More Details" disappear visually
In `src/components/app/ManualProductTab.tsx` (line 1217), restyle the `Collapsible` so when **closed**, it renders as a borderless inline link/button (e.g., "More details (optional) ▾") instead of a full bordered card. When **open**, it expands into the bordered card with the form fields. This matches the minimalist aesthetic and removes the awkward empty container.

Approach:
- Drop the always-on `rounded-2xl border bg-card p-4 sm:p-5` classes from the root `Collapsible`.
- Apply card styling conditionally only when `moreDetailsOpen === true`.
- When closed, render a slim inline trigger row (small text + chevron, no border) centered or left-aligned under the Product Details card.

## Files to edit

- `src/components/app/AddProductModal.tsx` — add `overflow-x-hidden` to the two body scroll wrappers (mobile drawer + desktop sheet).
- `src/components/app/ManualProductTab.tsx` — make the "More Details" Collapsible borderless when collapsed; only render the bordered card when expanded.

## Result

- No more horizontal scrollbar appearing inside the modal.
- "More Details" collapses to a tidy inline link instead of an empty bordered card. When clicked, it expands into a proper card with the optional fields.
- Modal looks clean: Product Details card → discreet "More details ▾" link → sticky Add Product footer.

