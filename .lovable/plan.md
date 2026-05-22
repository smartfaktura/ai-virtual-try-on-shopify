## Brand Scenes wizard — restructure steps 4-7

Split today's giant "Scene aesthetic" step into two focused steps (Environment + Photography & edit), drop the awkward "Category specifics" step, redesign Preview & pick, and lock the raw payload + compiled prompt behind admin only.

### New step map

```text
0 Source
1 Family
2 Sub-family
3 Who's in the scene        (cast — unchanged)
4 Environment               (NEW — the world the shot lives in)
5 Photography & edit        (NEW — how the shot is taken and graded)
6 Preview & pick            (redesigned)
7 Review                    (admin-only payload + compiled prompt)
```

The "Category specifics" step is removed entirely. Category-specific module questions (fashion/footwear/eyewear) have been the source of repeated complaints and the prompt already works without them. `answers.module_answers` stays in state with an empty default so saved-scene shape and the prompt builder don't break — no UI surfaces it.

### Step 4 — Environment

Pure "world / location / mood". Pulled out of today's `Step3BaseAnswers`:

- Scene type
- Setting / environment (unlocked once a scene type is picked)
- Weather / atmosphere
- Season
- Brand voice
- Aesthetic era
- Prop density
- Avoid in this scene (textarea)
- Notes (textarea)
- Collapsibles: "Backdrop & floor", "Light & time" (existing Stage-C groups)

### Step 5 — Photography & edit

Everything about how the photo is taken and graded:

- Camera & lens
- Depth of field
- Composition geometry
- Negative-space intent
- Subject focus
- Shadows / reflections
- Realism level
- Color palette anchor
- Color contrast
- Saturation
- Finish / film look
- Collapsibles: "Camera", "Composition & crop" (existing Stage-C groups)

Both new steps reuse the existing building blocks (`Section`, `ChipRow`, `PaletteBlock`, `StageCGroup`, `ExtrasPillField`, etc.) and write to the same `answers.base` object — no schema or prompt-builder changes. We just split the render into two files. The old `Step3BaseAnswers.tsx` is removed.

### Step 6 — Preview & pick (redesign)

Today it shows a debug `<pre>` of the directive plus three empty dashed boxes. New layout:

```text
┌─────────────────────────────────────────────┐
│  Ready to generate                          │
│  3 variations · 4:5 · {cost} credits        │
│                                             │
│  Compact summary: who · where · how shot ·  │
│  what to avoid                              │
│                                             │
│  [ Generate 3 variations ]  (primary CTA)   │
└─────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Variant1 │ Variant2 │ Variant3 │   ← placeholders until backend exists
└──────────┴──────────┴──────────┘
```

- Top card: friendly summary built from the same row data Step 7 already produces. No raw JSON, no `<pre>` directive.
- Primary action: "Generate 3 variations" button — stays disabled with a "Available in a later phase" tooltip (matches today's reality; backend not wired in this PR).
- Admin-only extras, gated by `useIsAdmin().isAdmin`, rendered below the variant grid:
  - Collapsible "Compiled prompt" panel showing `assembleSceneDirective(answers)`.
  - Collapsible "Raw payload" panel showing the full `answers` JSON.

Note: the wizard page is already admin-gated, but the admin-view toggle (`useAdminView`) means even an admin can choose to see the customer view — so gating these panels on `isAdmin` (not `isRealAdmin`) keeps the customer-view preview clean.

### Step 7 — Review

- For regular users (admin view off): keep the friendly `SummaryCard` (Scene / Look & light / Cast / Output buckets), keep the Avoid block, **drop the "Show payload" toggle entirely**.
- For admins (admin view on): add an always-visible "Admin debug" block with:
  1. **Compiled final prompt** — `assembleSceneDirective(answers)` in a monospace block.
  2. **Full payload** — pretty-printed JSON of all of `answers` (base, base.extras, cast, cast.extras, module_answers, reference_*, scale, auto, recommendations).

### Wizard plumbing

`BrandSceneWizard.tsx`:
- `META_WIZARD` updated:
  - `4`: "Environment" / "Where the shot lives — pick the world it sits in"
  - `5`: "Photography & edit" / "How the shot is taken and graded"
  - `6`: "Preview & pick" / "Review the scene, then generate 3 variations"
  - `7`: "Review" / "Confirm before saving"
- `META_REFERENCE` unchanged in shape: reference flow stays 0 → 1 → 2 → 3 ref → 4 cast → 6 preview → 7 review. Reference flow does NOT get env/photo split (reference uploads bypass all base styling). Existing `step === 4 && isReference → setStep 6` skip stays.
- Step routing in render switch:
  - `step === 4 && !isReference` → `<Step4Environment>`
  - `step === 5 && !isReference` → `<Step5Photography>` (replaces `Step4ModuleQuestions`)
  - `step === 6` → redesigned `Step6PreviewAndPick`
  - `step === 7` → `Step5Review` (with admin debug block inside)
- Gating: remove `moduleStepValid`, `moduleHasCustomQuestions`, and the `step === 5 && !isReference && !moduleStepValid` branch from `nextDisabled` / `nextDisabledReason`. Photography step has no required fields → step 5 is always passable. `Step1ChooseModule` auto-skip-to-step-3 behavior unchanged.

`useWizardState.ts`:
- Step-map comment block updated to match the new flow.
- No state shape changes.

`WizardLayout.tsx`:
- `STEPS_WIZARD` progress labels updated:
  - `{ n: 3, label: "Cast" }`
  - `{ n: 4, label: "Environment" }`
  - `{ n: 5, label: "Photo & edit" }`
  - `{ n: 6, label: "Preview" }`
  - `{ n: 7, label: "Review" }`

### Out of scope

- No prompt-builder changes — `assembleSceneDirective` and `module_answers` remain untouched, so existing saved scenes render identically.
- No DB / RLS / edge-function changes.
- No changes to the reference flow.
- Generation backend stays unimplemented; "Generate 3 variations" stays disabled.

### Files

**New**
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx`
- `src/features/brand-scenes/wizard/steps/Step5Photography.tsx`

**Modified**
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/useWizardState.ts`
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx`

**Deleted**
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`

`Step4ModuleQuestions.tsx` and the module-specific `*Questions.tsx` / `is*StepValid` helpers stay on disk (no longer wired) — safer than deleting given existing test coverage and saved-scene shape compatibility.
