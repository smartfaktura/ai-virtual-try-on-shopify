

## Hide redundant header + body filter on mobile model picker

In `src/components/app/freestyle/ModelSelectorChip.tsx`, the mobile sheet already renders "Character Reference" in its header, but the picker body repeats the title + subtitle and shows a second filter row (Slim/Athletic/Average/Plus) that crowds the small viewport.

### Change (single file: `ModelSelectorChip.tsx`)

1. **Remove the duplicate header on mobile.** Wrap the inner header block (the `<h3>Character Reference</h3>` + subtitle `<p>`) in `hidden lg:block` so it only shows in the desktop popover (which has no built-in title). Mobile sheet already shows the title.

2. **Hide the body-type filter row on mobile.** Wrap the BODY_FILTERS row in `hidden lg:flex` (instead of `flex`). Mobile keeps only the gender pills (All / Female / Male). Desktop is unchanged.

3. No state changes — `bodyFilter` defaults to `'all'`, so hiding the row simply means mobile users always see all body types (no filtering applied), which matches the request.

### Untouched

Desktop popover layout, gender filter, model grid, brand model card, footer, scenes modal, sidebar, hooks, RLS.

### Validation (390 × 818)

- Tap **Model** chip on `/app/freestyle` → sheet opens with single "Character Reference" header (from sheet only).
- Below header: only one filter row — All / Female / Male. No second body-type row.
- Model grid takes more vertical space, less crowded.
- Desktop ≥ 1024px: popover unchanged — both filter rows + inline header still visible.

