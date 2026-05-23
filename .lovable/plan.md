## Add Model Selection to Brand Scene Wizard

Let users attach a specific model (built-in or one of their brand models) to a Brand Scene generation, so the 3 preview variations come back with that exact face/body — same model catalog used elsewhere in the app (Product Images, Freestyle).

### Scope

Only kicks in when the Cast preset includes people (`solo`, `two`, `group`). Hidden for `none`, `hands`, `replicate`.

### UX

In `Step4Cast.tsx`, inside the **Cast** sub-step (right after preset/age/gender), add a new "Featured model" block:

- Empty state: small card with avatar placeholder + button **"Choose model"** + subtitle "Optional — pick a face for these variations".
- Picked state: 64×64 thumbnail, model name, "Change" / "Remove" links.
- Clicking opens the existing `ModelCatalogModal` (already supports built-ins + brand models + filters).
- For `two` / `group`, copy reads "Featured model (others auto-cast)" — only one anchor model is supported in v1.

A short helper line appears under the Cast preset chips: *"Tip: pick a model to lock the face across all 3 variations."*

### Data

Extend `BrandSceneCast` (`src/features/brand-scenes/types.ts`):

```ts
model_ref?: {
  modelId: string;
  name: string;
  sourceImageUrl: string;   // used as Gemini reference
  previewUrl: string;       // shown in wizard
  gender?: string;
  ageRange?: string;
  origin: "built_in" | "brand";
};
```

Persisted as part of `answers.cast` — no migration needed (JSONB).

### Prompt assembly

`buildCastDirective.ts`: when `model_ref` is present and preset has people, append:
`"Featured model: use the person from [MODEL IMAGE] exactly — preserve face, skin tone, hair, and proportions across all variations."`
This replaces the generic ethnicity/gender descriptor head when a model is locked (descriptors become redundant).

`injectReferenceTokens.ts` already injects `[MODEL IMAGE]` — when `model_ref` is set we force `hasPeople = true` so the token preamble is included even if Cast still says generic.

### Generation flow

`Step6PreviewAndPick.tsx` → `generateBrandScene({ ..., modelImageUrl })` passes `answers.cast?.model_ref?.sourceImageUrl`.

`brandSceneApi.ts`: add optional `modelImageUrl` to request body.

`supabase/functions/generate-brand-scene/index.ts`:
- Accept `modelImageUrl` in body.
- Fetch it via existing `urlToInlineData()`.
- Push it into `parts` **before** the existing reference image so Gemini treats it as the primary identity anchor: `parts = [modelInlineData?, referenceInlineData?, { text: prompt }]`.
- No credit-cost change.

### Saving

`saveBrandScene` already persists `compiledPrompt` with tokens. Add `model_ref` to the saved row so the scene, when reused in Product Visuals / Visual Studio, auto-pre-selects the same model. This means:
- `save-brand-scene/index.ts`: include `model_ref` in the inserted row (under a new `model_ref` JSONB column on `brand_scenes`).

### Migration

```sql
ALTER TABLE public.brand_scenes
  ADD COLUMN IF NOT EXISTS model_ref jsonb;
```
(No RLS change — existing policies cover it.)

### Files touched

- `src/features/brand-scenes/types.ts` — extend `BrandSceneCast`
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — new "Featured model" block + open `ModelCatalogModal`
- `src/features/brand-scenes/wizard/components/` — small `FeaturedModelPicker.tsx` wrapper
- `src/features/brand-scenes/prompt/buildCastDirective.ts` — emit `[MODEL IMAGE]` line when locked
- `src/features/brand-scenes/prompt/injectReferenceTokens.ts` — force hasPeople when model_ref present
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — pass `modelImageUrl`
- `src/features/brand-scenes/api/brandSceneApi.ts` — add field
- `supabase/functions/generate-brand-scene/index.ts` — accept & inject model image
- `supabase/functions/save-brand-scene/index.ts` — persist `model_ref`
- new migration adding `model_ref` jsonb column

### Out of scope (v1)

- Multi-model casting (group of 3 each with a brand model). Single anchor model only.
- Model swap *after* generation (would need re-gen).
- Auto-suggesting a brand model based on subfamily.