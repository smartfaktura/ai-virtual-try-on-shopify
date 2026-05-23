## Goal

Restructure the wizard so each step has a real, focused shape instead of being one long dump of sections. Specifically: split Step 4 "Who's in the scene?" into a true two-act flow, soften the "missing required" styling, and clean up Step 6 Review & Generate.

---

## 1. Split Step 4 into two sub-steps

Today Step 4 stacks ~12 sections vertically — required mixed with optional, group headers acting as scroll dividers. We turn it into two distinct wizard steps:

**Step 4a — "Who's in the scene?" (required-only)**

A single focused page with only the two required answers, big and centered, Typeform-style:

1. `Who's in the shot` — Solo / Two / Group / Hands / No people / Replicate
2. `Product interaction` — Wearing / Holding / Using / Beside / Hero
3. `Product scale` — only when the family exposes more than one option (still required when shown)

Nothing else. No optional sections, no group headers, no warnings panel. Next is gated on these alone. Mobile and desktop both fit on one screen without scrolling.

**Step 4b — "Refine the cast" (all optional)**

Everything else moves here, reorganized into **three horizontal tabs** at the top of the step body:

- **People** — gender, age, vibe, build, ethnicity, gaze, group dynamic, action
- **Interaction** — hands-on-product gesture, body-part focus
- **Styling** — wardrobe color anchor, all `ExtrasPillField` items (storytelling moment, etc.), free-form note

Each tab renders its sections in a `grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8` so desktop uses the horizontal space and mobile collapses cleanly. Empty tabs auto-hide (e.g. fragrance hides Styling-wardrobe). The whole step is **skippable** — Next is always enabled with a small "Skip refinements" affordance when nothing is set.

Warnings move to the bottom of Step 4b (they're contextual on the refinements, not on the required answers).

Wizard step count goes from 7 → 8. The progress bar already adapts.

---

## 2. Soften the "required & empty" state on `Section`

Drop the red ring + tinted background + red helper sentence — they read as an error before the user has even touched the field. Replace with a quiet cue:

- A small muted dot before the label
- The existing `Required` caption turns from `text-muted-foreground/60` to `text-foreground/70` when missing
- No box, no red, no helper sentence (the disabled-Next tooltip in the footer already explains)

---

## 3. Step 6 Review & Generate cleanup

Remove the three empty "Variant 1/2/3" placeholder cards that render before the user clicks Generate — they're confusing in a pre-generate state. Keep:

- Hero "Ready to generate" card with the Generate button
- Structured `Step5Review` summary
- Admin debug (unchanged)

Variant slots will be re-introduced when the Generate action is wired up in a later phase.

---

## Technical notes

- New step component: `src/features/brand-scenes/wizard/steps/Step4bRefine.tsx` (extracts the optional sections currently below the required ones in `Step4Cast.tsx`).
- `Step4Cast.tsx` shrinks to only the three required sections + scale.
- `BrandSceneWizard.tsx` step array gets one new entry between current Step 4 and current Step 5; labels: "Cast" → "Refine".
- `Section.tsx` swaps the missing-state styling block.
- `Step6PreviewAndPick.tsx` removes the variant placeholder grid.
- No schema, prompt, or option-set changes. No backend.

## Files touched

- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — register Step 4b, update labels.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — strip down to required-only.
- `src/features/brand-scenes/wizard/steps/Step4bRefine.tsx` — new file with tabbed optional sections.
- `src/features/brand-scenes/wizard/components/Section.tsx` — quieter missing-state.
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — drop variant placeholders.

## Out of scope

- Other wizard steps untouched.
- No copy rewrites beyond removing the red helper sentence.
- No changes to scenes/prompt logic, schemas, or DB.
