
What I found

- Yes — your suspicion is correct for this scene.
- The selected scene `Low-Angle Aesthetic Outfit Shot` does have an `outfit_hint`, but its saved `prompt_template` does not include `{{outfitDirective}}`.
- The prompt builder is currently template-led, so if a template forgets `{{outfitDirective}}`, the scene outfit hint never gets injected.
- I checked the latest queued Product Images prompt, and it contains only the hardcoded template sentence about the pants color — not the scene’s `OUTFIT DIRECTION` block. So the curated outfit prompt is being skipped for this scene.
- I also found that Product Images is not saving the exact resolved prompt into `generation_jobs.prompt_final`, which makes this harder to inspect after generation.

Plan

1. Fix prompt injection at the builder level
- In `src/lib/productImagePromptBuilder.ts`, create one shared resolver for scene outfit hints.
- Use that same resolved text everywhere outfit styling is referenced.

2. Make scene outfit hints impossible to skip
- In `buildDynamicPrompt`, if a scene has `outfitHint` but the template does not contain `{{outfitDirective}}`, auto-append the resolved outfit block.
- This makes scene-controlled outfit truly universal instead of depending on every admin template being perfect.

3. Clean up the broken scene template
- Update `Low-Angle Aesthetic Outfit Shot` so it uses `{{outfitDirective}}` instead of its own hardcoded outfit sentence.
- Audit other scenes with `outfit_hint` for the same problem.

4. Improve color wording for the model
- Add `aestheticColorLabel` next to `aestheticColorHex`.
- Resolve `{{aestheticColor}}` as something like `Dusty Blue (#5E7485)` instead of only a hex/fallback phrase.

5. Make future debugging visible
- In `src/pages/ProductImages.tsx`, send the resolved prompt in the payload so `prompt_final` is actually saved.
- Optionally show the resolved outfit/styling text in Review before generation.

Files to update

- `src/lib/productImagePromptBuilder.ts`
- `src/components/app/product-images/types.ts`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- `src/pages/ProductImages.tsx`
- the affected Product Images scene data row for `Low-Angle Aesthetic Outfit Shot`

Expected result

- The outfit direction will always be injected for scenes that define `outfit_hint`.
- Dusty Blue will be described clearly enough for the model to follow.
- We’ll be able to inspect the exact final prompt after each generation.
