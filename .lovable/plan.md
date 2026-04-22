

## Fix import scene defaults + add Outfit Direction with AI analyze

Three changes to `src/components/app/ImportFromScenesModal.tsx` (Step 2 of the Import Scenes modal at `/app/admin/product-image-scenes`).

### 1. Stop pre-selecting `background` trigger
In `goToStep2()` (line 130), change `trigger_blocks: ['background']` → `trigger_blocks: []`. Each imported scene starts with no triggers checked; admin opts in per scene.

### 2. Add **Outfit Direction** field per scene
- Extend `ImportConfig` with `outfit_hint: string` (default `''`).
- Render a new `<Textarea>` under the Trigger Blocks block, label "Outfit Direction" (placeholder: "Describe the outfit styling rules for this scene…").
- Pass `outfit_hint: config.outfit_hint || null` into the `upsertScene.mutateAsync(...)` call.
- Confirm `useProductImageScenes.upsertScene` already writes `outfit_hint` (the column exists on `product_image_scenes`). If not wired, add the field to the upsert payload mapping.

### 3. Add **Analyze** button next to Outfit Direction
A small ghost button with a Sparkles icon sits inline with the Outfit Direction label. On click:
- Calls existing edge function `describe-image` (or a thin new wrapper if needed) with `{ imageUrl: config.preview_image_url, mode: 'outfit_direction' }`.
- Edge side: prompt Gemini 2.5 Flash via Lovable AI Gateway with a fixed instruction — *"Analyze this reference image and produce a single-paragraph outfit direction for a premium e-commerce shoot. Describe the hero piece, complementary garments (matching tops/bottoms), styling tone, footwear logic, color coordination, and what to avoid. Output only the direction paragraph, no preamble."* Returns `{ outfit_hint: string }`.
- Button shows `Loader2` spinner while running, disabled when no `preview_image_url`. On success, fills the textarea (overwrites). On error, toast.

If `describe-image` already supports a generic prompt mode, reuse it as-is; otherwise add a new lightweight edge function `analyze-outfit-direction` (mirrors `describe-image` structure, fixed prompt above).

### Files touched
- `src/components/app/ImportFromScenesModal.tsx` — defaults, new textarea, Analyze button + handler, payload addition.
- `supabase/functions/describe-image/index.ts` — add `mode: 'outfit_direction'` branch **OR** new `supabase/functions/analyze-outfit-direction/index.ts` (decide after reading `describe-image`).
- (If needed) `src/hooks/useProductImageScenes.ts` — ensure `outfit_hint` is part of the upsert payload typing.

### Validation
- Open modal, select scenes, go to Step 2 → Trigger Blocks all start unchecked.
- Each scene shows an **Outfit Direction** textarea + **Analyze** button.
- Click Analyze on a scene with a preview image → spinner ~3-6s → textarea populates with a styled outfit paragraph.
- Import → row in `product_image_scenes` has `outfit_hint` populated and `trigger_blocks` reflects only what admin checked.

### Out of scope
- No changes to existing scenes' outfit hints, trigger defaults elsewhere, or the Step 1 selection UI.
- No changes to the prompt builder — `outfit_hint` is already consumed downstream.

