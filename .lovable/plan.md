## Goal
Complete the Step 4 ("Who's in the scene?") sub-step navigation so the wizard's Next/Back drive the internal Essentials → People → Interaction → Styling flow, with required-headline gating per sub-tab.

## Changes

### 1. `Step4Cast.tsx` — expose sub-step API via ref
- Convert active tab from internal `useState` to a controlled prop (`subStep`, `onSubStepChange`) passed by the wizard.
- Compute visible sub-steps via `computeStep4Flow(cast, family)` (already exists).
- Export a small helper object the wizard can read on each render:
  - `visibleSubSteps: SubStep[]`
  - `currentSubStep: SubStep`
  - `isFirstSubStep / isLastSubStep`
  - `subStepDisabledReason` from `getSubStepDisabledReason(cast, currentSubStep)`
- Implementation: lift `subStep` state up; pass derived flags down as props. No `useImperativeHandle` needed once state is lifted — simpler and matches existing wizard patterns.

### 2. `BrandSceneWizard.tsx` — intercept Next/Back on Step 4
- Add `const [step4SubStep, setStep4SubStep] = useState<SubStep>("essentials")`.
- When current wizard step is Step 4, compute `flow = computeStep4Flow(state.cast, state.family)` and derive `visible`, `idx`, `isLast`, `isFirst`.
- `handleNext`:
  - If on Step 4 and `design_specific_look === "yes"` and not on last visible sub-step → advance `step4SubStep` to next visible, do not change wizard step.
  - Else → existing wizard advance.
- `handleBack`:
  - If on Step 4 and not on first visible sub-step → step back through `step4SubStep`.
  - Else → existing wizard back; when returning to Step 4 from Step 5, set sub-step to last visible.
- `nextDisabledReason` on Step 4: use `getSubStepDisabledReason(state.cast, step4SubStep)`; falls through to existing step-level validation on the last sub-step.
- Reset `step4SubStep` to `"essentials"` whenever `design_specific_look` flips to `"skip"` or family changes such that flow shrinks.

### 3. Pass through props
- Wizard renders `<Step4Cast subStep={step4SubStep} onSubStepChange={setStep4SubStep} ... />`.

### 4. Polish
- Stepper chips in Step 4 remain clickable but only allow jumping to sub-steps whose headline is already satisfied (prevents skipping required headline).
- Keep the existing "Skip — auto-cast" path: when `design_specific_look === "skip"`, only Essentials is visible and Next exits Step 4 immediately.

## Out of scope
- No schema/migration changes (already done last round).
- No changes to other wizard steps, prompt assembly, or backend.
- No visual redesign beyond what last round shipped.

## Files
- edit `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- (optional) tiny export tweak in `src/features/brand-scenes/wizard/step4Flow.ts` if a helper is missing

## Verification
- Skip path: Essentials required fields → Next jumps to Step 5.
- Yes path: Next walks Essentials → People (Energy required) → Interaction (Action/Hands-on required) → Styling (Outfit vibe required) → Step 5.
- Back from Step 5 returns to Styling sub-step.
- Disabled Next shows headline-specific reason tooltip.
