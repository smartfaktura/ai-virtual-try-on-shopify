## Problem

When entering Step 4 ("Who's in the scene?") the wizard jumps straight to **Essentials** (the "Who's in the shot / How the product appears" cast picker). The **Auto-cast vs Design the look** branch card only appears *after* a cast preset has been picked — so the user has to make detailed choices first, then is asked whether they wanted Auto-cast or to design it themselves. The expected order is the opposite.

## Root cause

In `src/features/brand-scenes/wizard/step4Flow.ts`, `computeStep4Flow` short-circuits when there is no `cast.preset` yet:

```ts
if (isReplicate || isNone || !preset) {
  return { order: ["essentials"], visibleTabs: ["essentials"], showBranchCard: false };
}
```

Because there's no preset on first entry, the `look` tab (which renders the Auto-cast / Design the look branch card) is hidden until the user already filled out Essentials.

## Fix

Make the **Look** branch card the *first* sub-step of Step 4, shown before any cast preset is picked. The user chooses how they want to configure the scene, and only then proceeds.

### 1. `src/features/brand-scenes/wizard/step4Flow.ts`

- Remove the early-return for `!preset`. Keep the early-return for `replicate` / `none` (those are fully locked casts with no branching).
- When `!preset` (fresh entry):
  - `visibleTabs`: just `["look"]` (we don't know yet which optional tabs apply).
  - `order`: `["look"]` until a mode is chosen.
  - `showBranchCard: true`.
- When `preset` is set, behavior stays as today (compute People/Interaction/Styling tabs from the resolved registry, gate by `mode`).
- `getSubStepDisabledReason("look", …)`: require a mode to be chosen whenever `preset !== "replicate" && preset !== "none"` — including the empty-preset case. Message stays: *"Pick whether to design a specific look"*.
- `getSubStepDisabledReason("essentials", …)` unchanged (still requires preset + interaction once visited).

### 2. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — `setMode`

- `setMode("skip")` already seeds `seededPreset = cast?.preset ?? resolved.defaultCast` plus interaction/scale/base defaults — keep as is. After it runs, the `essentials` tab becomes valid and the user can hit **Next** straight from Look (Auto-cast summary already renders inline on the Look tab).
- `setMode("yes")` currently only writes `extras.design_specific_look = "yes"`. Add: after the patch, advance to the Essentials sub-step by calling `onSubStepChange?.("essentials")` so the user is moved into the cast picker. (`Step4Cast` already receives `onSubStepChange`.)

### 3. `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`

- Initial `step4SubStep` already defaults to `"look"` and `visitedSubSteps` already seeds `["look"]` — no change needed.
- The existing "snap to first sub-step if current disappears" effect handles re-entry correctly because `look` is now always in `order` on first entry.

## What the user will see

1. Enter Step 4 → only the **Look** tab is visible, showing the two branch cards (Auto-cast / Design the look). **Next** is disabled with the existing reason *"Pick whether to design a specific look"*.
2. Pick **Auto-cast** → the inline Auto-cast summary appears, defaults are seeded, **Next** enables.
3. Pick **Design the look** → wizard auto-advances to **Essentials**; the remaining tabs (People / Interaction / Styling · optional) become visible based on the cast preset they choose.

## Out of scope

- No copy changes to the branch cards or the Essentials picker.
- No changes to Styling-optional logic, prompt assembly, or registry data.
- No changes to persistence reset behavior (already always-blank on `/app/brand-scenes/new`).