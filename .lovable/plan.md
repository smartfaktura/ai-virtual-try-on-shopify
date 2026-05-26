## Bug

In `step4Flow.ts`:

```ts
if (!preset) {
  return { order: ["look"], visibleTabs: ["look"], showBranchCard: true };
}
```

When the user is on Look and picks "Design the look" (mode = "yes"), no cast preset is set yet, so `order` is `["look"]`. In `BrandSceneWizard.handleNext` the Step-4 sub-step block sees `idx === order.length - 1` and falls through to `dispatch({ type: "next" })`, advancing the whole wizard. Essentials (where the user actually picks how many people + interaction), People, Interaction, and Styling are silently skipped.

## Fix

**`src/features/brand-scenes/wizard/step4Flow.ts`** — when no preset is set yet, branch on `mode`:

- `mode === undefined` → only Look in order/visibleTabs, branch card shown (unchanged — user must pick a branch first).
- `mode === "skip"` (Auto-cast) → only Look (handled by the wizard's "Continue" shortcut that jumps past all sub-steps — unchanged).
- `mode === "yes"` (Design the look, no preset yet) → `order: ["look", "essentials"]`, `visibleTabs: ["look", "essentials"]`, `showBranchCard: true`. This makes Next go to Essentials where the user picks cast preset + interaction; once a preset is chosen the existing branch (line 75-103) takes over and adds People / Interaction / Styling tabs.

No other files change. The disabled-reason for `essentials` already returns "Choose who's in the shot" when no preset is set, which is the correct Next-button tooltip on the Look step once they pick "Design the look".

## Result

Look → (pick "Design the look") → Next → Essentials (pick people count + interaction) → Next → People → Next → Interaction → Next → Styling → Next → step 5.
