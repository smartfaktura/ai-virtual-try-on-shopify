## `src/components/app/product-images/ProductImagesStep4Review.tsx`

**1. Shorten page header (lines 185-186)**
- `Review & configure output` → `Review & generate`
- Drop subtitle line entirely.

**2. Remove redundant Format & Output card header (lines 205-208)**
- Delete the `<div class="space-y-1">…Format & Output…Pick the formats and how many images per scene…</div>` block — the two inner sections (Format / Images per scene) already have their own labels.

**3. Match Images per scene tile size with Format tiles, both more rounded (lines 221, 247, 225, 253)**
- Both grids: change `rounded-xl` → `rounded-2xl`.
- Format grid currently `grid-cols-3 sm:grid-cols-6` (5 items → 5 wide on desktop). Images per scene currently `grid-cols-4 sm:grid-cols-4 max-w-md` → tiles are smaller. Change Images per scene to `grid-cols-3 sm:grid-cols-6 max-w-none` so each tile takes the same width as a Format tile (with 4 of 6 columns filled). Drop `max-w-md`.
- Keep padding `px-4 py-2.5` identical on both (already matches).

**4. Hide Aesthetic settings and Person styling summary cards (lines 475-525)**
- Remove both `{aestheticEntries.length > 0 && …}` and `{personEntries.length > 0 && …}` blocks. User just set them in Step 3; no need to repeat on Step 4. Leave the Outfit summary (locked outfit) since that's a downstream lock indicator distinct from styling.

No logic changes, no state changes — copy and grid layout only.