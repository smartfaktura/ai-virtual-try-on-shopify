

## Fix desktop/tablet pill layout in Freestyle prompt bar

### What broke

In `FreestyleSettingsChips.tsx`, the wrapper divs around `productChip`, `modelChip`, and `sceneChip` (lines 221, 250, 266) were given `className="w-full"` during the mobile fix. On mobile that's correct (they sit inside a 2-column grid cell). On **desktop/tablet**, the parent is a `flex flex-wrap` row (line 478), so `w-full` makes each wrapper consume 100% of the row width — pushing every following chip onto its own line and producing the broken stack you're seeing in the screenshot (Product / Model / Scene Look each on their own row, leaving the rest cramped below).

### Fix — `src/components/app/freestyle/FreestyleSettingsChips.tsx`

Make the `w-full` on the three selector-chip wrappers conditional on mobile only:

- Line 221 (productChipInner wrapper): `'w-full'` → `isMobile && 'w-full'`
- Line 250 (modelChip wrapper): `'w-full'` → `isMobile && 'w-full'`
- Line 266 (sceneChip wrapper): `'w-full'` → `isMobile && 'w-full'`

That's the entire change. Three one-line edits.

### Why this works

- **Mobile (<768px)**: `isMobile === true`, wrappers stay `w-full`, mobile grid layout (with `cellClass` direct-child selectors and `fullWidth` props on the chips) keeps the equal 50/50 cells working exactly as we just fixed it.
- **Desktop/tablet (≥768px)**: `isMobile === false`, wrappers shrink to content width again. The chips render as inline-flex pills inside the `flex flex-wrap gap-2` row — the original, correct desktop layout returns.

### Untouched

Mobile grid (still belt-and-suspenders correct), Advanced popover, all selector internals, `fullWidth` prop logic, aspect-ratio chip's mobile/desktop conditional, `Freestyle.tsx`, hooks, RLS.

### Validation

- **Desktop ≥1024px**: All chips back on a single wrapping row — Upload, Product, Model, Scene Look, Framing, Brand, 1:1, Pro, Standard, Prompt Helper — each at its natural pill width.
- **Tablet 768–1023px**: Same as desktop (this branch kicks in at `md:`).
- **Mobile <768px**: Unchanged from current state — 2-column grid with equal-sized pills.

