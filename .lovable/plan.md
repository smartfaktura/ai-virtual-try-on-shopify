

## Preserve Scene Composition in Perspectives (People-Aware Prompting)

### Problem
The `buildPerspectivePrompt` function hardcodes `"No people, no human figures, no hands, no body parts"` in every prompt. If the source image shows a model wearing clothes or holding a product, the generation strips them out entirely and produces a product-only shot. The prompt should adapt: if the source is an on-model shot, keep the person; if product-only, keep it product-only.

### Approach
Since we already send the product image as base64 to the generation engine, we can classify the source image **before enqueuing** using a lightweight LLM call (via the existing Lovable AI gateway, same pattern as `analyze-product-image`). This classification determines whether the image contains people, and that flag flows into prompt construction.

### Changes

#### 1. `src/hooks/useGeneratePerspectives.ts` — Add scene classification + adapt prompts

**Add `sceneMode` parameter** to `buildPerspectivePrompt`:

```typescript
type SceneMode = 'product-only' | 'on-model';
```

**Classify each product image once** (before the variation loop) by calling a new helper that sends the base64 image to the `analyze-product-image` edge function with an extended prompt — or more efficiently, do a simple client-side LLM call via a new lightweight edge function, or reuse the existing one with an extra field.

Better approach — **avoid an extra network call**: add a `sceneMode` flag to `ProductInput` and detect it in the UI layer (Perspectives page) when the user selects/uploads an image. But simplest and most reliable: **classify at enqueue time** using a quick Lovable AI call from a new edge function `classify-scene`.

**Most pragmatic**: Add a new edge function `classify-scene` that takes a base64 image and returns `{ hasPeople: boolean }`. Call it once per product before the variation loop.

**Prompt changes based on `hasPeople`**:

- **System instruction**: Change from "product image" to "Reproduce this exact scene from a new camera angle. Preserve everything — the product, the person (if present), the setting, the pose, the styling."
- **Photography DNA**: When `hasPeople=true`, add body/pose preservation rules instead of "product fills X% of frame" rules.
- **Negatives**: Remove "No people, no human figures, no hands, no body parts" when `hasPeople=true`. Replace with "Do NOT change the model's face, body type, skin tone, hair, or clothing fit."
- **Identity block**: Expand to cover both product AND human subject identity preservation.

#### 2. New edge function `supabase/functions/classify-scene/index.ts`

Lightweight function that sends the image to Lovable AI (Gemini Flash — fast + cheap) with a simple prompt:

```
"Does this image contain a person (human model, hand, body part) wearing, holding, or interacting with a product? Return ONLY a JSON object: { \"hasPeople\": true/false }"
```

Returns `{ hasPeople: boolean }`. Called once per source image, cached for the batch.

#### 3. Prompt engineering detail for `hasPeople = true`

**System instruction**:
> Reproduce this exact scene from a new camera angle. The scene contains a human model with a product. Preserve BOTH the product identity AND the human subject — same person, same pose intent, same styling, same garment fit. The ONLY change is the camera angle.

**Identity block** (replaces product-only block):
> SCENE IDENTITY — STRICT: Preserve the EXACT product from [SOURCE IMAGE] — shape, material, color, texture, logos, hardware. ALSO preserve the human subject — same apparent age, ethnicity, skin tone, hair style/color, body type, and facial features. The garment/product must fit and drape identically. Do NOT swap, age, or alter the model. Do NOT change the product design.

**Negatives** (replaces "no people" list):
> - Do NOT change the model's face, body type, skin tone, hair, or clothing fit
> - Do NOT remove the person from the scene
> - Do NOT add additional people
> - Maintain the same styling, accessories, and overall aesthetic

**Photography DNA adjustments** per category when `hasPeople`:
- **Macro**: Focus on product detail area while person may be partially visible (hand holding product, fabric on body)
- **Angle**: Full scene rotation — model + product together from new angle, same pose intent
- **Context**: Wider environmental shot with model in scene

### Files changed
| File | Change |
|------|--------|
| `supabase/functions/classify-scene/index.ts` | New edge function — lightweight people detection via Lovable AI |
| `src/hooks/useGeneratePerspectives.ts` | Call classify-scene per product, pass `hasPeople` flag to `buildPerspectivePrompt`, rewrite all prompt sections to be scene-mode-aware |

