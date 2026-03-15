

## Fix Product Perspectives in Generate Page

### Problems
1. **Missing "From Library" source option** — The `SourceTypeSelector` component only has "From Product(s)" and "From Scratch". The Product Perspectives workflow needs a third "From Library" option to let users pick from previously generated images.
2. **Brand step shouldn't appear** — The stepper shows "Brand" as step 2, but brand selection isn't relevant for the Perspectives workflow. The flow should go: Source → Settings → Results.

### Changes

#### 1. `src/components/app/SourceTypeSelector.tsx`
- Add a `showLibrary` prop (default `false`)
- When `true`, add a third card: "From Library" with `id: 'library'` and an `ImageIcon` icon
- Update `GenerationSourceType` in `src/types/index.ts` to include `'library'` if not already there

#### 2. `src/types/index.ts`
- Check if `GenerationSourceType` includes `'library'` — add it if missing

#### 3. `src/pages/Generate.tsx`
- For the Product Perspectives workflow (variation strategy type `'angle'`), pass `showLibrary={true}` to `SourceTypeSelector`
- Skip the `brand-profile` step for this workflow — after product/library/upload selection, go directly to `settings`
- Update `getSteps()` to return `[Source, Settings, Results]` for angle-type workflows (no Brand step)
- Update `getStepNumber()` accordingly
- When `sourceType === 'library'`, show a library image picker grid (similar to the one in `Perspectives.tsx`) — fetch from `freestyle_generations` and `generation_jobs`, allow multi-select up to 10
- Wire the selected library items into the generation payload the same way products are handled

#### 4. Step flow for Product Perspectives
```
Source (product / library / scratch) → Settings (angle checkboxes + ratios) → Results
```
No brand step. The `handleProductSelect` and upload continue handlers should skip `brand-profile` when the workflow is Product Perspectives (angle type).

### Summary
Two targeted fixes: add "From Library" as a third source card option, and skip the Brand step for angle-type workflows. The library picker reuses the query pattern already built in `Perspectives.tsx`.

