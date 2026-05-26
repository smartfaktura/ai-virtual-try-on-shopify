## Cleaner header on Product Images results step

On `/app/generate/product-images` the generic page header ("Create Product Visuals — Choose one or more products to start generating visuals") stays visible even after generation finishes, duplicating space above the real result headline ("Your visuals are ready").

### Change

**`src/pages/ProductImages.tsx` (line 1396):** wrap `PageHeader` in `{step !== 6 && (...)}` so it renders during the wizard but disappears on the results step. No new components, no copy edits, no behavior change.

**`src/components/app/product-images/ProductImagesStep6Results.tsx` (lines 106–114):** lift the results headline so it acts as the page header on this step:
- Wrapper: change top-level `space-y-8` to keep, but switch the headline block from `text-center` to left-aligned and bump sizing.
- `h2` → `text-2xl sm:text-3xl font-semibold tracking-tight` (matches `PageHeader` scale).
- Remove the centered `CheckCircle` icon row; instead render headline left-aligned with the subtitle directly below: `{totalImages} image{...} generated successfully`.
- Keep the small primary `CheckCircle` inline before the headline at `w-5 h-5` for a subtle success cue.

Result: results page opens with just the success headline + subtitle in the same slot the page title used to occupy — less stacked text, more clarity.

### Files

- `src/pages/ProductImages.tsx`
- `src/components/app/product-images/ProductImagesStep6Results.tsx`
