## Fixes for Step 4 (Cast & product interaction)

Three small, scoped UI fixes. No schema, prompt, or business-logic changes.

### 1. Remove Quick / Detailed toggle (for real this time)

The previous "revert" left the toggle wired up. It still renders at the top of Step 4 and gates half the UI with `isQuick`.

- Delete `src/features/brand-scenes/wizard/components/QuickDetailedToggle.tsx`
- Delete `src/features/brand-scenes/__tests__/wizard-polish-7s.test.ts`
- In `Step4Cast.tsx`: remove the `QuickDetailedToggle` import + render, the `useWizardMode` / `isQuick` derivation, the `+ Customize cast & styling` link block, and drop every `!isQuick &&` guard so the previously-detailed sections always render.
- In `Step4ModuleQuestions.tsx`: remove the toggle + `+ Customize details` link and the `mode` prop pass-through.
- In `FashionQuestions.tsx`, `FootwearQuestions.tsx`, `EyewearQuestions.tsx`: drop the optional `mode` prop and any `mode === "quick" | "detailed"` gates; render all fields unconditionally (Step 5 dedup from Phase 7r stays).
- Remove the `brand-scene-wizard:mode` sessionStorage key reference.

### 2. Soften the "required & empty" styling

`Section.tsx` currently wraps required-but-empty sections in `ring-1 ring-destructive/60 ring-offset-4 animate-pulse` — that's the red box on "Product interaction" the user dislikes.

- Drop the ring + pulse entirely. Keep the red asterisk on the label and the existing inline "Pick how the cast interacts with the product" reason at the bottom of the wizard (already rendered by `WizardLayout` via `nextDisabledReason`).
- Keep `data-missing` attribute for any tests / scroll-into-view logic.

### 3. Show only relevant Product Scale options

For Clothing, the registry already restricts `resolved.scale.values` to `["on_body"]`, but Step 4 renders all six chips (Pocket, Handheld, Carry, Furniture, Architectural, Wearable on body). Furniture/Architectural make no sense for a t-shirt.

- In `Step4Cast.tsx`, replace `showAllScales(expanded)` with the filtered list `SCALE_PRESETS.filter(s => resolved.scale.values.includes(s.value))`. Remove the unused `showAllScales` helper and the legacy `expanded` render-prop in the Scale `<Section>`.
- When the filtered list has exactly one option, hide the entire Product Scale `<Section>` (the default is already auto-seeded in the existing `useEffect`, so gating still passes). The `+ Add exact size` escape hatch goes with it; users who need a custom size can switch sub-family.

### Out of scope
- All other Phase 7r/7s polish (gender fix, ethnicity dedup, build placement, Step 5 Setting/Scene dedup, inline disabled-reason) stays as is.
- No prompt builder / saved-scene format changes.

### Files touched
- Edit: `Step4Cast.tsx`, `Step4ModuleQuestions.tsx`, `FashionQuestions.tsx`, `FootwearQuestions.tsx`, `EyewearQuestions.tsx`, `Section.tsx`, `.lovable/plan.md`
- Delete: `QuickDetailedToggle.tsx`, `wizard-polish-7s.test.ts`
