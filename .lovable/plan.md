# Phase 1 — Dead Code & Terminology Cleanup

Scope: smallest blast radius from the Brand Scenes QA. No logic changes, no DB, no prompt engine. Three small edits.

## Changes

### 1. Remove unreachable "Auto-selected (locked)" branch
File: `src/components/brand-scenes/steps/Step2ChooseSubFamily.tsx`

- `BrandSceneWizard` already auto-skips Step 2 when a module exposes only one sub-family, so the `locked` card never renders.
- Delete the `locked`-branch JSX and its conditional.
- Remove the `locked` prop from the component signature and any unused imports (icon, helper text constants).
- Leave the multi-option grid untouched.

### 2. Fix Step 3 "Replace" icon mismatch
File: `src/components/brand-scenes/steps/Step3References.tsx`

- The "Replace" action currently uses the `Trash` icon, suggesting destructive intent.
- Swap to `RefreshCw` (lucide-react) to match the actual handler (replaces the file, does not delete the slot).
- No handler change. Keep the separate explicit delete control untouched.

### 3. Make step counter reflect actually visible steps
File: `src/components/brand-scenes/BrandSceneWizard.tsx`

- Counter currently renders `{currentStep + 1} / 07`.
- Replace hard-coded `07` with `visibleSteps.length`.
- Replace numerator with `visibleSteps.indexOf(currentStep) + 1` so a skipped Step 2 shows `02 / 06` on Step 3 (not `03 / 07`).
- `visibleSteps` derivation already exists in the file — reuse it; do not duplicate.

## Out of scope for Phase 1

- Allowlist edits (Phase 2)
- Back/Next/skip routing logic, draft-restore snapping (Phase 3)
- Storage cleanup on delete (Phase 4)
- Empty states, mobile polish, token cleanup (Phase 5)

## Verification

- Open `/app/brand-scenes/new` with a single-sub-family module (e.g. fragrance) → Step 2 still auto-skips; no dead "locked" card flashes.
- Open with a multi-sub-family module (e.g. apparel) → Step 2 still renders the option grid normally.
- Step 3: hover "Replace" → icon is `RefreshCw`, tooltip/label unchanged.
- Counter: on a flow that skips Step 2, header reads `01 / 06`, `02 / 06`, …; on a full flow it reads `01 / 07` … `07 / 07`.
- No TypeScript errors, no console warnings.

Approve to implement Phase 1.