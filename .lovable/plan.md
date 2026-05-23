## Goal

Make "Design a specific look?" its own dedicated **first sub-step** inside Step 4 (Cast). Today it sits at the top of the Essentials tab and gates the rest of that tab. Move it out to a standalone "Look" sub-step. After the user answers (Skip or Yes), the wizard advances to Essentials, then — only if Yes — through People / Interaction / Styling.

## Changes

### 1. `src/features/brand-scenes/wizard/step4Flow.ts`
- Extend `Step4SubStep` union with `"look"`.
- In `computeStep4Flow`, when the branch applies (preset chosen and not `replicate` / `none`), **prepend `"look"`** to both `visibleTabs` and `order`. `order` becomes:
  - mode `undefined` → `["look"]`
  - mode `"skip"` → `["look", "essentials"]`
  - mode `"yes"` → `["look", "essentials", ...optional tabs]`
- `getSubStepDisabledReason`:
  - New case `"look"` — returns "Pick whether to design a specific look" until `getStep4Mode(cast)` is set.
  - Remove the branch-mode check from the `"essentials"` case (it's now enforced on the `look` step).

### 2. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- Add `"look"` to the `labelMap` (label: **"Look"**).
- Render a new `subStep === "look"` block that contains **only** the existing `Section` + two `BranchCard`s (Skip / Yes). Auto-fades in.
- In `subStep === "essentials"`, drop the branch card and the `(!flow.showBranchCard || !!mode)` gate — Essentials now renders Who's in shot / Product interaction / Product scale directly.
- The "no longer visible" guard already snaps back to `"essentials"`; update it to snap back to `"look"` when `look` is in `visibleTabs`, otherwise `"essentials"`.

### 3. `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- Add `look: "Look"` to `SUB_LABEL` so the Next button reads "Continue to Essentials" after the user answers the Look step.
- Initial `step4SubStep` state stays `"essentials"`; the snap-back effect (existing) will move it to `"look"` on first visit because `"essentials"` won't be in `order` until the branch is answered. Update the initial fallback in that effect to land on `order[0]` instead of hard-coded `"essentials"`.

## Out of scope
No prompt, schema, validation-rules, or other step changes. Visual styling reuses existing `Section`, `BranchCard`, and tab pill components.