## Phase 7m — Wizard chrome & residual legacy cleanup

Another sweep after 7l. Focused on small but real bugs around the wizard's step header (reference flow), the Review summary, and one dead validation rule that hasn't fired since Phase 7k.

### Issues found

1. **Reference flow shows the wrong title on step 4.**
   `META_REFERENCE` only overrides step 3 (Reference & intent). On step 4 the user sees the **Cast** UI, but the header still reads `"Scene aesthetic — Pick the kind of scene you want — we'll match the rest"` (inherited from `META_WIZARD`). Should read `"Cast & product interaction"`.

2. **Sub-family chip is appended to reference step 3.**
   `stepShowsSubFamily = step === 3 || 4 || 5` adds `· Sub-family` to the title. On reference flow step 3 the screen is "Reference & intent" — the sub-family chip there is noise.

3. **Step5Review hides the user's free-text notes.**
   Both `base.notes` (Scene-level notes) and `cast.note` (Cast note) are written by the wizard but never surfaced in the Summary card. Avoid is shown; Notes is not. Users lose visibility of what they typed.

4. **Dead validation rule in `combinationGuards.ts`.**
   The "night + clear" warning still keys off `base.time_of_day === "night"`, but that field was retired in Phase 7k — the wizard now writes `extras.time_of_day_detail`. The warning has been silently dead since 7k. Either re-wire it to read the detail string, or drop it.

### Fixes

**`wizard/BrandSceneWizard.tsx`**
- Add `4: { title: "Cast & product interaction", subtitle: "Who's in the scene and how they relate to the product" }` to `META_REFERENCE`.
- Tighten the sub-family chip: `const stepShowsSubFamily = (step === 3 && !isReference) || step === 4 || step === 5;` so reference step 3 stays clean.

**`wizard/steps/Step5Review.tsx`** — extend the Scene bucket with a `Notes` row (from `base.notes`, truncated) and the Cast bucket with a `Cast note` row (from `cast.note`, truncated). Both already pass through `Bucket`'s value-filter so empty values stay hidden.

**`wizard/rules/combinationGuards.ts`** — replace the dead night/clear check with a read against `base.extras?.time_of_day_detail` (case-insensitive `startsWith("night")` or `startsWith("after dark")`), so the existing soft warning fires again. Keep the same `severity: "warn"` + message.

### Tests

New `wizard-polish-7m.test.tsx`:
- `META_REFERENCE` resolves step 4 title to "Cast & product interaction".
- Step5Review renders `Notes` row when `base.notes` is set, and `Cast note` row when `cast.note` is set; both omitted when empty.
- `combinationGuards.warnings(...)` returns the night-clear warning when `extras.time_of_day_detail` starts with "Night" and `weather === "clear"`, and silence otherwise.

### Files
- **Edited**: `wizard/BrandSceneWizard.tsx`, `wizard/steps/Step5Review.tsx`, `wizard/rules/combinationGuards.ts`.
- **New**: `__tests__/wizard-polish-7m.test.tsx`.

No DB / schema / generation behavior changes. The `placement_hint`, `base.aesthetic`, `base.mood`, `base.lighting`, `base.framing`, `cast.diversity` legacy fields stay in place for back-compat read paths and aren't touched here.