## Brand Scenes — fix credits, naming, saved-scene hygiene & dynamic tokens

Four real issues in `/app/brand-scenes/new`. Scope is the brand-scenes wizard + `save-brand-scene` edge function only. No changes to global generation pipeline.

---

### 1. Credits aren't visibly deducted

Today `generate-brand-scene` already calls `deduct_credits(user, 20)` and returns `new_balance`, but the UI never propagates it — the sidebar credit chip is only refreshed on focus/queue events, so the deduction looks invisible right after Generate / Regenerate.

Fix:
- In `Step6PreviewAndPick.handleGenerate`, after a successful `generateBrandScene`, push the returned `new_balance` into our existing credits store (the same path used by `useCredits` / queue completion). Show a small toast `−20 credits (balance: N)`.
- If `INSUFFICIENT_CREDITS` comes back, also dispatch a refetch so the chip syncs.
- Add a single integration test (`generate-brand-scene_test.ts`) asserting `deduct_credits` is called once per request and `new_balance` is in the response shape.

### 2. Scene name should be mandatory (wizard flow too)

Currently `name` is only required in the reference flow's Step 3. In the wizard flow it defaults to `"Untitled scene"`, so users save unnamed library entries.

Fix:
- Add a `Scene name` input at the top of `Step6PreviewAndPick` (wizard flow). For the reference flow it stays in Step 3.
- Gate `Generate` and `Regenerate` buttons on `answers.name?.trim().length >= 2`. Show the same disabled-reason pattern (`"Name this scene"`).
- Add the same name guard on the server in `save-brand-scene` (already present) and `generate-brand-scene` (new — reject 400 if missing) so a stale client can't bypass it.

### 3. Saved scene has empty "Outfit Direction" & no trigger blocks → no model can be picked

`save-brand-scene` hardcodes `trigger_blocks: []` and never writes `outfit_hint`. Downstream the Product Images model/outfit pickers rely on these two fields, so saved brand scenes show up but can't generate with a model.

Fix in `save-brand-scene/index.ts`:
- Derive `trigger_blocks` from `answers.cast.preset` using `CAST_PRESETS_WITH_PEOPLE`:
  - people scene → `['personDetails']` (plus `['outfit']` if any outfit slot or `reference_outfit.description` is set)
  - product-only scene → `[]` (unchanged)
- Persist `outfit_hint` by reusing the same logic our prompt assembler uses:
  - prefer manual `answers.cast.outfit` slots → join via existing `OUTFIT_*` directives
  - else fall back to `answers.reference_outfit.description`
  - else empty string
- Persist `scene_type` already (already done) and add `requires_extra_reference: false` so it matches the schema of admin-imported scenes.
- Add `product_image_scenes` insert test asserting `trigger_blocks`/`outfit_hint` are correctly set for `solo`, `duo`, and `productOnly` cast presets.

### 4. Compiled prompt has no `[MODEL IMAGE]` / `[PRODUCT IMAGE]` dynamics

`assembleSceneDirective` writes a fully self-contained directive. When the scene is later used inside Product Images, `generate-workflow` swaps `[PRODUCT IMAGE]` and `[MODEL IMAGE]` placeholders into the template — without those tokens, the user's actual product/model references are never referenced in-prompt and the model substitutes generic stand-ins (the same root cause as "lingerie scene without lingerie").

Fix:
- Add a new helper `injectReferenceTokens(directive, { hasPeople })` in `src/features/brand-scenes/prompt/`:
  - Prepends a `REFERENCE TOKENS` header explaining `[PRODUCT IMAGE]` is the hero garment/object and (when `hasPeople`) `[MODEL IMAGE]` is the cast subject.
  - Rewrites the `PRODUCT FOCUS` and `SUBJECT` sections to refer to `[PRODUCT IMAGE]` / `[MODEL IMAGE]` explicitly (string-level replace on the already-emitted lines, e.g. `"Hero garment"` → `"Hero garment from [PRODUCT IMAGE]"`, `"the model"` → `"the person from [MODEL IMAGE]"`).
- `Step6PreviewAndPick.handleGenerate` keeps using `directive` directly (the live preview still needs no placeholder because we feed a literal reference image in `referenceInlineData`). Only the value sent to `save-brand-scene` as `compiledPrompt` goes through `injectReferenceTokens` — so the **stored** `prompt_template` carries the tokens that downstream `generate-workflow` already knows how to substitute.
- Snapshot test in `__tests__/assembleSceneDirective.test.ts` verifying the saved template contains `[PRODUCT IMAGE]` always, and `[MODEL IMAGE]` only when the cast has people.

---

### Files

- `supabase/functions/generate-brand-scene/index.ts` — 400 on missing name, response unchanged.
- `supabase/functions/save-brand-scene/index.ts` — derive `trigger_blocks`, `outfit_hint`, `requires_extra_reference`.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — small refactor so cast / product-focus lines are token-friendly.
- `src/features/brand-scenes/prompt/injectReferenceTokens.ts` *(new)*.
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — name input + gating, credit refresh, tokenised save payload.
- `src/features/brand-scenes/api/brandSceneApi.ts` — pass through `new_balance` to caller (already typed, just wire it).
- `src/features/brand-scenes/__tests__/*` — 2 new tests as described.

### Out of scope

- No DB migration.
- No changes to `generate-workflow`, Product Images UI, or the credit balance RPC.
- No new sub-family wardrobe registries (lingerie work landed earlier).
