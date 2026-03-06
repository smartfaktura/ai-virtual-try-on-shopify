

## Remove Redundant "Selected Products" Card on Model Step

The `TryOnPreview` component already displays product thumbnails, count badge ("2 products"), and credit cost. The separate "Selected Products" card beneath it is redundant.

### Change in `src/pages/Generate.tsx` (lines 2299-2316)

Remove the `{isMultiProductMode && (<Card>...Selected Products...</Card>)}` block on the Model selection step. The `TryOnPreview` above already shows the same information.

