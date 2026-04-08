

# Fix Packaging Detail Hallucinations, Open Bottle Reference, and Near Face Hold Model Identity

## Problems Found

### 1. Packaging Detail — hallucinating multiple products + wrong look
The `packaging-detail-fragrance` template says "Tight macro close-up of the packaging for {{productName}}" but:
- Does NOT start with `[PRODUCT IMAGE]` — so the AI doesn't anchor to the actual product photo
- Mentions "packaging" generically, allowing the AI to invent packaging designs
- The packaging reference image IS sent as a separate `[PACKAGING REFERENCE]` part, but the template never instructs the AI to reproduce it faithfully
- **Fix**: Rewrite the template to start with `[PRODUCT IMAGE]` and add explicit "reproduce the EXACT packaging shown in [PACKAGING REFERENCE]" directive with product fidelity constraints

### 2. Open Bottle — no reference image = guessing
The scene has `requires_extra_reference: false` and `openBottle` in trigger_blocks. The `openBottle` trigger causes a reference upload card in Setup, but only if `requires_extra_reference` interacts with the REFERENCE_TRIGGERS system. Looking at the frontend code (line 409-418 of ProductImages.tsx), the trigger-based ref upload IS available (`REFERENCE_TRIGGERS[tb]`), so the upload card should appear. If the user doesn't upload an open bottle reference, the AI has no idea what the opened bottle looks like.
- **Fix**: Set `requires_extra_reference: true` so the UI emphasizes that this reference is needed. Also strengthen the template to say "if no [PRODUCT EXTRA ANGLE] reference is provided, show the bottle with cap placed beside it"

### 3. Near Face Hold — different model face
Root cause: The template uses literal `[MODEL REFERENCE]` text, but `generate-workflow` does NOT perform text replacement of `[MODEL REFERENCE]` → `the person from image N` (unlike `generate-freestyle` which does at line 505). The AI sees:
- Prompt text: `[MODEL REFERENCE] {{personDirective}} Tight close-up of the exact selected model...`
- Image parts: `[MODEL IMAGE] Identity reference — the person MUST look like this:` + actual image

The disconnect between `[MODEL REFERENCE]` (in prompt text) and `[MODEL IMAGE]` (in image label) can confuse the model. Additionally, `scene_type: macro` applies a 100mm macro lens which is wrong for a face-level close-up.

**Fixes**:
- Change `scene_type` from `macro` to `portrait` 
- Remove `[MODEL REFERENCE]` text from template — the `modelBlock` (identity preservation block) is already injected by `buildVariationPrompt` when `body.model` is present, and the image is labeled `[MODEL IMAGE]`
- Replace references to `[MODEL REFERENCE]` with `[MODEL IMAGE]` to match the actual label

## Database Migration

```sql
-- 1. Fix Packaging Detail: anchor to product + packaging reference
UPDATE product_image_scenes
SET prompt_template = '[PRODUCT IMAGE] {{productName}} — tight macro close-up of the product packaging, cropped closely around a key packaging detail such as the printed logo, embossed branding, foil stamp, paper texture, edge construction, corner finish, label application, or other premium structural element. The framing should isolate the packaging itself as the main subject and should read as a strict packaging detail study rather than a full product shot. If a [PACKAGING REFERENCE] image is provided, reproduce its design, typography, colors, and construction EXACTLY — do not hallucinate or invent packaging elements. Show ONLY ONE product and its packaging. Do NOT generate multiple bottles, boxes, or duplicates. {{background}} Lit with soft controlled studio lighting that reveals fine print detail, subtle embossing, material grain, carton finish, and realistic surface depth without harsh glare or artificial shine. Shadows should remain delicate and natural, helping define the packaging texture and structure while keeping the image clean and luxurious. Preserve crisp typography, believable paper or carton material behavior, refined finish transitions, and premium commercial macro realism. Tight crop, packaging dominant, single product only. {{packagingDirective}}'
WHERE scene_id = 'packaging-detail-fragrance';

-- 2. Fix Open Bottle: require extra reference
UPDATE product_image_scenes
SET requires_extra_reference = true
WHERE scene_id = 'open-bottle-fragrance';

-- 3. Fix Near Face Hold: correct scene_type + fix model reference token
UPDATE product_image_scenes
SET scene_type = 'portrait',
    prompt_template = '{{personDirective}} Tight close-up of the exact selected model holding [PRODUCT IMAGE] {{productName}} beside the face near the cheek or jawline. Show only face, hand, and bottle. The person MUST match [MODEL IMAGE] exactly — same face, same features, same skin tone, same hair. Do not generate a different person. Preserve the exact reference product only: exact bottle shape, cap, label, branding, glass tint, and proportions. Do not redesign or reinterpret the bottle. BACKGROUND: {{background}} — use ONLY this background across the entire frame. Keep it smooth, flat, clean, and fully consistent with no gradient drift, no scene change, and no extra environment. Soft diffused beauty light, realistic skin texture, visible pores, natural facial detail. HAND ANATOMY: anatomically correct hand with exactly five fingers, natural proportions, realistic grip. Realistic glass reflections, visible liquid depth, premium fragrance realism. No full body, no wide crop, no different model, no different bottle.'
WHERE scene_id = 'near-face-hold-fragrance';
```

## Files Modified
1. **Database migration only** — three `UPDATE` statements to `product_image_scenes`

No frontend or edge function code changes needed.

