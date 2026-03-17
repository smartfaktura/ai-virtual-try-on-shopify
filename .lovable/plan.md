

## Add Library Source Option to Image Upscaling & Remove Pre-selection

### Changes

**1. `src/pages/Generate.tsx`**
- Change `sourceType` initial state from `'product'` to `null` (need to update type to allow null, or use a sentinel). Actually, since `GenerationSourceType` may not include `null`, we'll initialize to `''` or handle it differently. Simplest: keep type but don't highlight any option initially — change initial value logic so that for the source step, nothing is pre-selected. We can use a new state like `sourceChosen` boolean, or just set initial to `'product'` but not show "Selected" indicator until user clicks. Cleanest: initialize `sourceType` to `null` with a cast, and disable the Continue button until a source is chosen.

- Update line 1728: pass `showLibrary={isAngleWorkflow || isUpscale}` so the upscale workflow also shows the "From Library" option.

- Update the step map for upscale (line 1452) to include `library: 1`.

- Update the Continue button (line 1731) — already handles `library` source type.

- In the library step (line 2937+), when upscale is active and user selects library items, navigate to `'settings'` instead of the default next step (it already does this for single items via `setCurrentStep('settings')` — need to confirm multi-select path).

**2. `src/pages/Generate.tsx` — Remove pre-selection**
- Change initial state: `useState<GenerationSourceType | null>(null)` 
- Update the Continue button to be disabled when `sourceType` is null
- Update `SourceTypeSelector` to accept `null` and not highlight anything initially
- The try-on inline buttons also need the same treatment

**3. `src/components/app/SourceTypeSelector.tsx`**
- Update prop type to accept `GenerationSourceType | null`
- No option will have the selected styling when `sourceType` is `null`

### Summary
- 2 files modified: `Generate.tsx`, `SourceTypeSelector.tsx`
- Adds "From Library" as 3rd source option for upscale workflow
- Removes auto-selection of "From Product(s)" on page load

