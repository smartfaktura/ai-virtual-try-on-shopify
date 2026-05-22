## Phase 7r — Brand Scene Wizard UX cleanup

Pure frontend/presentation pass. No DB, no prompt-assembler, no schema changes.

### 1. Bug: "Gender mix" with 1 person
Step 4 (Cast) renders the same "Gender mix" multiselect for every cast preset that has people, including `solo` and `hands`. Mixing makes no sense for 1 subject.

Fix in `Step4Cast.tsx`:
- Rename label dynamically: `Gender` when `preset ∈ {solo, hands}`, `Gender mix` only when `preset ∈ {two, group}`.
- For `solo`/`hands`, render single-select chips (collapse `gender` array to one entry on click). Stored value stays an array for schema parity.
- Same treatment for `Age feel` (solo = 1 age band; group keeps multiselect).

### 2. "Build" lives in the wrong section
`build` is currently rendered inside the Stage-C "More creative dials" extras loop at the bottom of Step 4. Users expect it near the people dials.

Fix:
- Add an explicit `<Section label="Build">` block right after Vibe (only when `hasPeople && !isReplicate`), wired to `cast.extras.build` using `buildsForCast(preset)`.
- Filter `build` out of the `applicableFields(...)` extras loop so it doesn't appear twice.

### 3. Ethnicity subtitle duplicated
`Section label="Ethnicity / casting hint"` wraps `EthnicityChips`, which renders its own `Ethnicity / casting hint` header + info tooltip — same label printed twice.

Fix:
- Drop the outer `<Section label="Ethnicity / casting hint">` wrapper in `Step4Cast.tsx`; render `<EthnicityChips />` directly. Keep the inner header + tooltip (it owns the explanation).

### 4. Kill the "+ Show all" / "− Tuned only" button
Reads like dev jargon and creates a second hidden layer on top of the Stage-C collapsibles.

Fix in `components/Section.tsx`:
- Remove the expandable toggle entirely. `Section` becomes a plain wrapper.
- For sections that previously toggled expansion (Cast preset, Interaction, Scale, Camera & lens, DOF, Palette, Finish), pass the full list directly. Tuned-first ordering is preserved by sorting `resolved.*` matches to the front and appending the remainder muted (`opacity-60`) so users still see "what we recommend" without a hidden mode.
- Update `Step3BaseAnswers.tsx` and `Step4Cast.tsx` callers: replace `(expanded) => ...` render-props with the sorted list helper.

### 5. "Category details" step is redundant
Step 5 (`Step4ModuleQuestions`) re-asks shot context already chosen in Step 4 (e.g. shot type, framing). For modules without truly unique fields it's noise.

Fix:
- Audit `modules/{fashion,footwear,eyewear}/questions.ts` and remove any field whose answer is already captured by Step 4 (scene_type, setting, body_part_focus, hands_on_product, camera_angle_*, cast/interaction). Keep only module-specific dials (e.g. fashion fit/silhouette, footwear lacing/closure, eyewear lens tint).
- If after pruning a module has 0 questions, auto-skip Step 5 (gating already allows this — add the skip in `BrandSceneWizard.handleNext`).
- Rename step header from "Category details" to `"{SubFamily} specifics"` — clarifies it's *not* re-asking the scene.

### 6. "More creative dials" header doesn't match the flow
Header is engineering-y and sits inside "Scene aesthetic" with no visual demarcation.

Fix in `Step3BaseAnswers.tsx`:
- Rename group header to `Optional fine-tuning`.
- Add one-line helper underneath: `Skip this — we'll pick smart defaults`.
- Visually de-emphasize (smaller, muted) so users know it's safe to ignore.

### 7. Gray Next button gives no signal
Today the disabled reason only appears in a tooltip. On mobile (the current 440px viewport) there is no hover → tooltip never shows.

Fix in `WizardLayout.tsx`:
- Always render `nextDisabledReason` as inline text right above the Back/Next row (`text-[12px] text-destructive/80`) when present.
- Keep the existing scroll-to-missing-section behavior on click.
- Add a pulsing dot next to the section label of every required-but-empty `Section` (Section already has `data-missing` plumbing — wire it from each step by passing `missing={!value}` to required Sections).

### 8. Quiz mode — Quick vs Detailed
Address the "20 boxes from first view" complaint without rebuilding the flow.

Fix:
- Add a top-of-step toggle on **Step 4 (Aesthetic)** and **Step 5 (Specifics)**:
  - **Quick** (default): show only required Section + Scene type + Setting. Everything else is replaced by a single `+ Customize` button that expands the full panel.
  - **Detailed**: current full view.
- Toggle state lives in component-local `useState` (no schema). Choice is remembered per session via `sessionStorage`.
- Quick mode lets the user reach Step 6 (Preview) after answering ~3 questions; smart defaults from existing `resolved.*` registry fill the rest.

### 9. Wording polish (brand voice rule)
- Step 4 subtitle: "Pick the kind of scene you want — we'll match the rest" (already clean, no period).
- Section hints: drop terminal periods on single-sentence hints in `Section.hint`, `SceneTypePicker`, `SettingPicker`.

### Files to touch
**Modified**
- `src/features/brand-scenes/wizard/components/Section.tsx`
- `src/features/brand-scenes/wizard/components/EthnicityChips.tsx` (no change — verified inner header is the source of truth)
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`
- `src/features/brand-scenes/wizard/steps/Step4ModuleQuestions.tsx`
- `src/features/brand-scenes/wizard/WizardLayout.tsx`
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` (auto-skip Step 5 when 0 questions)
- `src/features/brand-scenes/modules/{fashion,footwear,eyewear}/questions.ts` (prune redundant fields)

**New**
- `src/features/brand-scenes/wizard/components/QuickDetailedToggle.tsx`
- `src/features/brand-scenes/__tests__/wizard-polish-7r.test.tsx` — unit tests covering:
  - Gender label flips to "Gender" for solo/hands, "Gender mix" for two/group
  - Build chip rendered once, near Vibe, not in extras loop
  - EthnicityChips header rendered exactly once
  - `Section` exports no `expandable` prop / no "Show all" text anywhere
  - `WizardLayout` shows `nextDisabledReason` inline on disabled
  - Pruned module questions absent from `questions.ts`

### Out of scope
- Restructuring step order or merging Cast + Aesthetic into one step
- Prompt assembler changes (data shape unchanged)
- Backend / scene saving / publishing logic
- Visual redesign beyond the rewording + hierarchy fixes above
