Make the **Generate** button on `/app/brand-scenes/new` Step 6 actually generate 3 photoreal preview variations from the assembled directive (optionally seeded with the reference image), let the user pick one, and save it to their personal scene library. Mirrors the existing brand-models native-Gemini flow.

## Current gaps

1. The Generate button is hard-disabled with a "Available in a later phase" tooltip — no backend call exists.
2. No edge function for brand-scene image generation.
3. No credit deduction / refund path wired for this surface.
4. No Pick → Save UI; nothing persists the chosen variation.
5. No surfacing of 402 / 429 / generation failures to the user.

## Reuse, don't reinvent

- `product_image_scenes` already natively supports user-owned brand scenes: columns `is_brand_scene`, `owner_user_id`, `brand_scene_module`, `brand_scene_schema_version`, `brand_scene_answers`, plus RLS letting authenticated users insert/update/delete rows where `owner_user_id = auth.uid() AND is_brand_scene = true`. The trigger `protect_brand_scene_writes` enforces `scene_id LIKE 'brand-%'` and ownership rules. **We save into this existing table — no new `brand_scenes` table is needed.**
- `brand-scene-references` bucket is already public. Generated previews go into the same bucket under `generated/{user_id}/{run_id}/v{n}.{ext}` so no new bucket / no migration for storage.
- `deduct_credits` and `refund_credits` RPCs exist and are the same path brand-models uses.
- Native Gemini call pattern (helpers `detectImageFormat`, `urlToInlineData`, `gemini-3-pro-image-preview` via `x-goog-api-key`) is copied from `generate-user-model/index.ts` — matches the "Native Gemini Generation" memory.

## Implementation

### A. Storage RLS (single small migration)
Add object-level policies on `brand-scene-references` so the existing user-owned reference uploads keep working **and** the new `generated/{user_id}/...` writes from the service role + reads from anyone:

- INSERT/UPDATE/DELETE: `bucket_id = 'brand-scene-references' AND auth.uid()::text = (storage.foldername(name))[1]` (covers `{user_id}/...` reference uploads exactly as today). Service role bypasses RLS so the edge function can write under `generated/{user_id}/...` regardless.
- SELECT: bucket is public; no extra policy needed.

If the policies above already exist (likely, since references already upload), this migration is a no-op — verify and skip.

### B. Edge function `generate-brand-scene`
- POST body validated with Zod: `{ answers: BrandSceneAnswers, name: string }`. **Do not trust a client-supplied prompt** — re-assemble the directive server-side from `answers` using a Deno-port of `assembleSceneDirective` (small, pure helper — copy the file under `supabase/functions/_shared/assembleSceneDirective.ts` and import from both surfaces).
- Auth: `supabaseAdmin.auth.getUser(token)` from `Authorization: Bearer …`, return 401 on miss.
- Deduct: `deduct_credits(user_id, BRAND_SCENE_GENERATION_COST=20)`; on `Insufficient credits` exception → 402.
- Reference: if `answers.source === 'reference'` and `answers.reference_image_paths[0]` is present, `urlToInlineData(publicUrl)` and put it before the text part in the Gemini call.
- Generate 3 variations in **parallel** (`Promise.allSettled`) with native Gemini `gemini-3-pro-image-preview`. Suffix each prompt with a tiny variant tag (`"\nVARIATION 1 of 3"`, etc.) to encourage diversity. Per-call retry once on `gemini-3.1-flash-image-preview` (matches the global Pro → Flash fallback memory; Seedream is skipped here because it's not the brand-models pattern).
- Upload each successful base64 image to `brand-scene-references/generated/{user_id}/{run_id}/v{n}.{ext}` (format detected via magic bytes).
- Refund: if **zero** variations succeed → `refund_credits(user_id, 20)`, return 502 with message. Partial success keeps the charge (same as brand-models behaviour).
- Response: `{ runId, variations: [{ index, url }] }`.
- Errors: surface 429 ("Too many requests — please wait a moment") and 402 ("Add credits to continue") with the exact same JSON shape other functions use.
- `supabase/config.toml`: default `verify_jwt = false` is fine (we validate in code).

### C. Edge function `save-brand-scene`
- POST body: `{ answers, name, pickedVariationUrl, compiledPrompt }`.
- Auth same as above.
- Validate `pickedVariationUrl` starts with the project's storage URL **and** contains `/brand-scene-references/generated/{user_id}/` — rejects cross-user URLs.
- Insert into `product_image_scenes` with:
  - `scene_id = 'brand-' + crypto.randomUUID()`
  - `is_brand_scene = true`, `owner_user_id = user.id`
  - `brand_scene_module = answers.module`, `brand_scene_answers = answers`, `brand_scene_schema_version = 1`
  - `title = name`, `description = first sentence of compiledPrompt`
  - `prompt_template = compiledPrompt`
  - `preview_image_url = pickedVariationUrl`
  - `scene_type = answers.base?.scene_type ?? 'packshot'`, `category_collection = null`
  - `is_active = true`, `sort_order = 0`
- Return the row.

### D. Frontend (`Step6PreviewAndPick.tsx` + helpers)
- Activate the Generate button: calls `supabase.functions.invoke('generate-brand-scene', { body: { answers, name } })`.
- While running: replace the hero card with a branded loading state (animated phase icons + "Generating 3 variations — about 30 seconds"), matching the existing product-images loading UX memory.
- On success: render a 3-up grid (`BrandSceneVariationGrid.tsx`) of square-ish tiles with hover and a check overlay on the selected one. Below: sticky footer with **Save to library** (calls `save-brand-scene`) and a subtle **Regenerate** link (explicit confirm dialog: "Generate 3 more for 20 credits?").
- On save success: toast "Saved to your library" and `navigate('/app/brand-scenes')`.
- Error toasts: 402 ("Add credits to continue"), 429 ("Too many requests, try again shortly"), generic ("Generation failed — credits were refunded").
- Disable the wizard footer Next/Back during loading and during the picked-but-unsaved state to prevent losing the variations.

### E. New typed client wrappers
- `src/features/brand-scenes/api/brandSceneApi.ts` exports `generateBrandScene(answers, name)` and `saveBrandScene(payload)` — both use `supabase.functions.invoke` and normalize 402/429 into typed errors.

## Files

**New**
- `supabase/functions/_shared/assembleSceneDirective.ts` — pure Deno port of the existing assembler.
- `supabase/functions/generate-brand-scene/index.ts`
- `supabase/functions/save-brand-scene/index.ts`
- `src/features/brand-scenes/api/brandSceneApi.ts`
- `src/features/brand-scenes/wizard/components/BrandSceneVariationGrid.tsx`
- `src/features/brand-scenes/wizard/components/BrandSceneGenerateLoading.tsx`
- (Migration only if needed) `supabase/migrations/<ts>_brand_scene_references_generated_select.sql`

**Edited**
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — activate Generate, render variations + Save.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — suppress footer Next/Back during gen / unsaved-pick state; redirect on save.

## Out of scope
- No new pricing logic — uses the existing `BRAND_SCENE_GENERATION_COST = 20` and `deduct_credits` / `refund_credits`.
- No changes to upstream wizard steps or the `analyze-reference-outfit` function.
- No `/app/brand-scenes` index/listing page work beyond the post-save toast redirect.
- No video generation.

## Verification
- Manual end-to-end on `/app/brand-scenes/new` → 3 variations appear → pick + save → row visible in `product_image_scenes` with `is_brand_scene=true, owner_user_id=auth.uid()`.
- `curl` `generate-brand-scene` with a short prompt → 200 + 3 URLs returned.
- Force-fail the Gemini call (temporarily bad model name in test) → 502 returned, `credits_balance` restored.
- Sign in as user B and try to `save-brand-scene` with user A's `pickedVariationUrl` → 403.
- Existing brand-models flow still works (we did not touch `generate-user-model`).
