## Improve Step 4 sub-flow

**1. Drop the numbers from tab pills (`Step4Cast.tsx`)**
Remove the `<span className="opacity-60 tabular-nums">{idx + 1}</span>` from each tab pill. Tabs become plain labels: `Essentials`, `People`, `Interaction`, `Styling`. The done-checkmark stays.

**2. Make the wizard Next button signpost the next sub-step**
- Add an optional `nextLabel?: string` prop to `WizardLayout`. When provided (and not the last step), the CTA renders that label instead of plain `Next` (keeps the arrow icon). Tooltip + disabled behavior unchanged.
- In `BrandSceneWizard.tsx`, when on the Cast step and there is a next sub-step in `step4Flow.order`, pass `nextLabel={"Continue to " + LABEL[nextSubStep]}` (e.g. `Continue to People`). On the last sub-step it falls back to plain `Next` so the user understands the next click leaves Step 4.

**3. Helper text on the tab row**
Update the right-aligned hint in the Step 4 tab row to read `Step {n} of {visibleTabs.length}` instead of `Required headline · rest optional` — clearer signal that Next walks through them.

No schema, prompt, or other-step changes. Scope is Step 4 tab labels + Next-button copy.

### Files
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`