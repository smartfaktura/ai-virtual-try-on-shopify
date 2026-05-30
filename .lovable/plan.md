## Goal
On `/app/generate/product-images`, swap the order of the two top blocks so the step progress bar sits at the very top of the wizard, with the step title + subtitle below it.

## Current order (src/pages/ProductImages.tsx, lines 1382–1396)
1. Title + subtitle (`stepHeader`)
2. `CatalogStepper`

## New order
1. `CatalogStepper` (steps 1–4 only, as today)
2. Title + subtitle

## Change
In `src/pages/ProductImages.tsx` (~lines 1382–1396), reorder the two JSX blocks. Keep:
- Same content, copy, and components — only order changes
- Stepper still gated by `step <= 4`
- Spacing tuned so the new layout breathes: stepper first, then ~16–20px gap, then title/subtitle. Likely drop `mb-2` from the header wrapper and rely on the parent `space-y-6` for rhythm; add a small `mb-4`/`mb-6` to the stepper wrapper if needed after a quick visual check.

## Scope
- One file: `src/pages/ProductImages.tsx`
- No logic, no other routes, no copy changes
- No impact on steps 5 (Generating) and 6 (Results), since stepper is already hidden there