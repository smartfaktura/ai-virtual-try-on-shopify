## Remove Product Scale from Brand Scene wizard

The "Product scale" section (Mini / Pocket / Handheld / Tabletop / Other + Exact size) will be removed from the Step 4 Cast UI. The wizard will no longer ask the user to pick a product scale; defaults from the category registry continue to drive the prompt under the hood, but nothing in the UI is gated on it.

### Changes

1. **`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**
   - Delete the `{/* Product scale */}` block (lines ~424–471) including the chips, the "Other" note input, and the "Exact size" toggle/inputs.
   - Remove the now-unused local state `showExact`, helpers `visibleScales`, and the related imports (`SCALE_PRESETS`, `AddChip`, `ExactDimensions`, `Input` if unused elsewhere in the file).
   - Remove the `showScaleSection` branch around the deleted block.
   - Keep `scalePreset` derivation (still needed to filter forbidden interactions and the people/interaction sub-tabs); it will simply use `resolved.scale.default` whenever the user hasn't set one (which is now always).
   - Remove the Essentials summary chip for scale (around line 612, `scaleLabel`) so the summary no longer shows a Scale chip.

2. **`src/features/brand-scenes/wizard/step4Flow.ts` (and any step-validation helper)**
   - Drop `scale?.preset` from the required-fields check for Step 4 so the step can complete without picking a scale.

3. **No schema/prompt changes**
   - `BrandSceneScale`, `buildScaleDirective`, and registry presets stay intact. The directive will use the category default scale silently. This keeps prompt quality without exposing the control.

### Out of scope
- No changes to other wizard steps.
- No changes to backend, schema, or prompt assembly logic.
