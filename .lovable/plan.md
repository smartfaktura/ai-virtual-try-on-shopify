# Reference-source brand scenes — final flow

## The mental model

A **reference scene** is a regular brand scene whose preview image **is** the brief. At generation time we send that preview as the visual composition guide (same mechanism as the existing "Use preview as generation reference" toggle on admin scenes). The AI replicates framing, lighting, environment, outfit (if any), and props — and swaps in the product.

So we do **not** quiz the user about aesthetic, mood, palette, lighting, location, framing, outfit, or any module-specific question. The image owns all of that. Asking again would create contradictions between the form answers and the image.

The only ambiguity the image **can't** resolve on its own is *where the product goes* — especially for non-apparel items (skincare, fragrance, food, accessories). So we add one tiny optional field for that, and one optional free-text note for anything else.

## What we ask (reference path)

1. **Source** — pick "Use reference image" (existing Step 0, unchanged).
2. **Family + sub-family** — needed only so the scene files under the correct catalog tab (e.g. Fashion → Dresses, Skincare → Serums). Same picker as the wizard path. Auto-skip sub-family when the family has 1 sub.
3. **Upload reference** — exactly **1 image** (JPG/PNG/WEBP, ≤8MB). Becomes `preview_image_url`.
4. **Scene name** — required, max 80 chars. Used in the brand scenes list.
5. **Product placement** — optional, max 120 chars. Free text describing where the product should sit in the scene. Examples shown as placeholders: *"held in the model's hand, label facing camera"*, *"resting on the marble counter, lower-right third"*, *"floating hero center, slight tilt"*. If blank, AI defaults to natural placement inferred from the reference composition.
6. **Extra direction** — optional, max 240 chars. Anything else the user wants to nudge, e.g. *"keep mood quieter than reference"* or *"product label fully visible"*.

Then Review → Save.

## What we skip (reference path)

- Step 3 base answers (aesthetic, palette, mood, lighting, location, framing, notes)
- Step 4 module questions (Fashion / Footwear / Eyewear specifics, including outfit pickers)
- AI mood-extraction edge function — dropped; image is the truth.

### Why no outfit picker on this path

The reference already shows the wardrobe (or absence of a person). Letting the user pick a different outfit forces the AI to choose between the image and the form, and the result is mush. Outfit, props, lighting, and environment are all "inherited from reference, untouched."

## What we ask (wizard path)

Unchanged from current implementation — full Step 3 base answers + Step 4 module questions + the existing outfit logic.

## Saved row shape

Both paths save into `product_image_scenes` with `is_brand_scene = true`. Reference scenes differ only in:

- `preview_image_url` = public URL of the uploaded reference
- `brand_scene_answers.source = 'reference'`
- `brand_scene_answers.reference_image_paths = [storagePath]` (single entry)
- `brand_scene_answers.base = {}` and `module_answers = {}` (empty by design)
- `brand_scene_answers.placement_hint` = the optional placement string
- `prompt_hint` = the optional "Extra direction" note
- `use_preview_as_reference = true` (or equivalent flag — confirmed against the existing admin field in Phase 7b prompt builder) so generation auto-ticks the "use preview as reference" behavior

## UI changes vs. what's already built

- `Step0ChooseSource` — keep, no change.
- `Step1ChooseModule` — keep; remove the inline `ReferenceImagePicker` from this step.
- `Step2ChooseSubFamily` — keep, runs for both paths.
- **New `Step3Reference`** — shown only when `source === 'reference'`. Single-image dropzone (real Supabase upload) + Name field + Product placement field + Extra direction field. Replaces Steps 3+4 for this path.
- `Step3BaseAnswers` + `Step4ModuleQuestions` — still shown, but **only when `source === 'wizard'`**.
- `Step5Review` — branch the summary by source. Reference: show thumbnail + name + placement + extra direction. Wizard: existing payload.
- `useWizardState` — add `name`, `placement_hint`, `note` to answers; add corresponding setters and a `setReferenceImage(path)` action (single string, not array). Route step transitions based on source so the reference path is 4 visible steps.
- `BrandSceneWizard` — re-route steps:
  - Reference path: Source → Family → Sub-family → Reference upload (image + name + placement + extra) → Review
  - Wizard path: unchanged 6 steps.

## Storage + RLS

New private bucket `brand-scene-references`. Per-user folder RLS via `auth.uid()::text`. Admin override SELECT. One file per scene under `{auth.uid()}/{sceneId}.{ext}`. On scene delete, best-effort remove the storage object.

## Acceptance for this phase

- Reference path completes in ≤60s: source → family → upload + name + (optional) placement → save.
- Saved row has `preview_image_url` populated and shows up on `/app/brand-scenes` immediately.
- No base/module fields are written when source is `reference`.
- `placement_hint` round-trips into `brand_scene_answers`.
- Wizard path is unchanged.
- `bunx vitest run src/features/brand-scenes` stays green; add one new test covering the reference save shape (including `placement_hint`).

## Explicitly out of scope here

- Generation wiring that actually consumes `use_preview_as_reference` + `placement_hint` (Phase 7b/7d).
- The 3-variation generation flow + 20-credit charge for **generating** brand scenes from prompts. That's the wizard-path payment flow and a separate workstream — this plan covers the reference path only.
