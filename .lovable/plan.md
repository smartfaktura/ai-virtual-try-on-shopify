## Changes

**1. Equal-size product family cards (`Step1ChooseModule.tsx`)**
- Add `auto-rows-fr` to the grid so every `WizardCard` stretches to the tallest card's height regardless of label length.

**2. Review & Generate hero (`Step6PreviewAndPick.tsx`)**
- Drop `· 4:5` from the headline so it reads: `{N} variations · {cost} credits`.
- Replace the line "Saving the scene is free. Only generating variations deducts credits." with:
  > "We'll generate {N} preview variations. After they're ready, you can save the one you like best to your library."

**3. Review summary (`Step5Review.tsx`)**
- Remove the `Aspect ratio: 4:5 (locked)` row from `outputRows` so it no longer appears in the Output bucket.

No schema, prompt assembly, or wizard navigation changes. Scope is copy + layout only.