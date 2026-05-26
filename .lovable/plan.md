## Make Styling sub-step optional in Step 4

The Styling tab currently blocks Next with "Pick an outfit vibe to continue" — even when the Outfit Quiz is hidden (e.g. Rings, where `preset === "hands"` removes OutfitQuiz from the UI). Result: the user can complete every visible field and still be stuck. Fix by making the entire Styling sub-step optional and surfacing that in the UI.

### Changes

1. **`src/features/brand-scenes/wizard/step4Flow.ts`**
   - In `getSubStepDisabledReason`, change the `if (sub === "styling")` branch to `return null;` — Styling no longer gates Next.

2. **`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**
   - Tab label: change `styling: "Styling"` → `styling: "Styling · optional"` in the `labelMap` so the tab itself reads as optional.
   - Drop the `outfitVibeMissing` red-dot pipeline: stop computing it, stop passing it into `StylingTab`, remove the prop from `StylingTab`'s signature, and remove the `vibeRequired` flag passed to `<OutfitQuiz>`.
   - Inside `StylingTab`, append " · optional" to the Section labels that aren't visually required anymore: `"Wardrobe color anchor"`, `"Note"`, and any other Section without a `required` prop in this tab.

3. **`src/features/brand-scenes/wizard/components/OutfitQuiz.tsx`**
   - When `vibeRequired` is false/undefined, render the "Outfit vibe" Section label as `"Outfit vibe · optional"` (keep current behavior when `vibeRequired` is true so other call sites don't change).

### Out of scope
- No changes to People, Essentials, Interaction validation (those stay required as they are today).
- No prompt/registry changes — empty styling fields already fall back to sensible defaults in `assembleSceneDirective`.
