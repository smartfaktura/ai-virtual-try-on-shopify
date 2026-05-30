## Fix mobile UX on `/app/perspectives` source selector

Frontend only — `src/pages/Perspectives.tsx`, Step 1 ("Choose Source").

### Problem

On mobile the source selector uses `grid-cols-1` so the three "From Library / From Products / From Scratch" cards stack full-width. After tapping one, the picker panel renders below all three cards, forcing the user to scroll past the other two to find the actual picker they just opened.

### Fix

Make the selector compact on mobile so all three options fit in one row and the picker appears immediately under them — same pattern desktop already has.

In the source-cards section (around lines 845–876):

1. Change grid to `grid-cols-3` at every breakpoint (drop `sm:grid-cols-3` distinction): `grid grid-cols-3 gap-2 sm:gap-3`.
2. Tighten card padding on mobile: `p-2.5 sm:p-4`.
3. Center contents on mobile, left-align on desktop: replace inner `space-y-2` wrapper with `flex flex-col items-center text-center sm:items-start sm:text-left gap-1.5 sm:gap-2`.
4. Make the icon tile smaller on mobile: `w-9 h-9 sm:w-10 sm:h-10`.
5. Title/description sizing:
   - Title: keep `text-sm font-semibold`, add `leading-tight`.
   - Description: hide on mobile (`hidden sm:block`) — the icon + title is enough on a 390px screen.
6. "Selected" indicator: hide the text on mobile, keep the dot — `hidden sm:flex` on the row, or shrink it to just the dot. Simplest: keep `flex` but make the label `hidden sm:inline`.

Result on mobile: a 3-up row of compact icon-cards (Library / Products / Scratch), and the chosen source's picker (search field, grid, or uploader) appears directly under the row — no more scrolling past unrelated cards.

### Out of scope

- No changes to picker contents, generation logic, variations, or desktop layout (cards still look the same ≥ sm).
- No changes to the page hero, step 2 (variations), or step 3 (ratios).
