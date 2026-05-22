## Phase 7n — Cast/ethnicity prompt-plumbing & stale-comment cleanup

Another sweep after 7m. Three real issues found, all caused by Phase 7k/7j leftovers that the previous polish rounds didn't catch.

### Issues found

1. **`cast.extras.ethnicity` is rendered as an ugly fallback string in prompts.**
   Phase 7k added the `EthnicityChips` UI which writes `cast.extras.ethnicity`. But `ethnicity` is intentionally **not** in `CAST_EXTRAS_FIELDS` (so it doesn't render as a duplicate pill block). The downstream consequence in `assembleSceneDirective.ts`:
   ```
   const knownCastKeys = new Set(CAST_EXTRAS_FIELDS.map((f) => f.key));
   for (const [k, v] of Object.entries(castExtras)) {
     if (!knownCastKeys.has(k) && v?.trim()) {
       lines.push(`Cast style (${k}): ${v.trim()}.`);   // ← ethnicity hits this
     }
   }
   ```
   Prompts ship with `Cast style (ethnicity): Pan-European.` instead of a clean `Ethnicity: Pan-European.`. Same problem appears in **Step5Review**: the Cast bucket maps `CAST_EXTRAS_FIELDS` only, so the user's ethnicity choice is invisible in the summary.

2. **`cast.diversity` is dead code in the prompt pipeline.**
   `buildCastDirective.ts:83-84` still reads `cast.diversity` via `DIVERSITY_OPTIONS` and appends it to the cast descriptor. The wizard hasn't written `cast.diversity` since Phase 7k — `EthnicityChips` writes `cast.extras.ethnicity` instead. The line is dead for new scenes; only legacy data triggers it, and even then it conflicts with the new ethnicity path. Should be removed for prompt hygiene.

3. **Stale step-map docstring in `useWizardState.ts`.**
   The header comment claims:
   ```
   3 Scene aesthetic (wizard) | Reference & intent (reference)
   4 Cast & product interaction (BOTH flows)
   ```
   But `BrandSceneWizard.tsx` actually wires wizard flow as **step 3 = Cast** and **step 4 = Scene aesthetic** (since the Phase 7i reorder). Future maintainers will trust the comment and get confused. Pure docs fix, but worth correcting.

### Fixes

**`prompt/assembleSceneDirective.ts`** — surface ethnicity as a first-class line before the unknown-key fallback loop:
```ts
if (castExtras.ethnicity?.trim()) {
  lines.push(`Ethnicity: ${castExtras.ethnicity.trim()}.`);
}
```
…and extend `knownCastKeys` with `"ethnicity"` so the fallback loop no longer double-emits it.

**`prompt/buildCastDirective.ts`** — drop the dead `cast.diversity` branch (and the `DIVERSITY_OPTIONS` import). Keep the `Diversity` type import removed too. Old-scene `diversity` values stop appearing in prompts; ethnicity (via `extras.ethnicity`) is the single source of truth.

**`wizard/steps/Step5Review.tsx`** — Cast bucket: prepend an explicit `{ label: "Ethnicity", value: castExtras.ethnicity }` row so the user sees it in the summary alongside the other cast fields.

**`wizard/useWizardState.ts`** — correct the step-map docblock to match reality:
```
3 Cast & product interaction (wizard) | Reference & intent (reference)
4 Scene aesthetic (wizard) | Cast & product interaction (reference)
```

### Tests

New `wizard-polish-7n.test.tsx`:
- `assembleSceneDirective` emits `Ethnicity: Pan-European.` (not `Cast style (ethnicity): …`) when `cast.extras.ethnicity` is set.
- `assembleSceneDirective` emits **only one** ethnicity line (no double-emit via the unknown-key fallback).
- `buildCastDirective` no longer references `cast.diversity` — passing a legacy `diversity` value does not append a descriptor.
- `Step5Review` renders an `Ethnicity` row when `cast.extras.ethnicity` is set, and omits it when unset.

### Files
- **Edited**: `prompt/assembleSceneDirective.ts`, `prompt/buildCastDirective.ts`, `wizard/steps/Step5Review.tsx`, `wizard/useWizardState.ts`.
- **New**: `__tests__/wizard-polish-7n.test.tsx`.

No DB / schema / type-contract changes. Legacy `cast.diversity` field stays on the type for back-compat reads (the schema still accepts it), it just stops getting rendered in prompts.