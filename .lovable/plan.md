
## Add "Apply my outfit to all shots" toggle

### Where
In `ProductImagesStep3Refine.tsx`, replace the current static hint line ("Some shots have their own styling direction…") with a compact toggle row that flips the existing `details.outfitOverrideEnabled` flag.

### UI
```
ⓘ  Some shots have their own styling direction.
   Apply my outfit to all shots                        [ ⚪ Switch ]
```
- Only renders when at least one selected scene has `outfit_hint` (existing condition).
- `Switch` bound to `details.outfitOverrideEnabled`.
- When ON: subtitle changes to "Your outfit selection will override all curated styling."
- Switch is disabled (with tooltip "Pick an outfit first") until an outfit exists — either AI Stylist auto-pick or manual `outfitConfig` is set.

### Wiring
- Reuse existing `outfitOverrideEnabled` field (already in `DetailSettings`, already honored in `productImagePromptBuilder.ts`). No new state, no new prompt logic.
- Toggle handler: `updateDetails({ outfitOverrideEnabled: checked })`.

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — replace the hint `<p>` with toggle row using existing `Switch` component.

### Validation
1. Select shots where some have `outfit_hint` → toggle row appears
2. Toggle disabled until outfit picked (AI Stylist counts) → tooltip explains
3. Flip ON → all shots use your outfit on generate; OFF → curated styling restored
4. No `outfit_hint` scenes selected → row hidden (unchanged behavior)
