

# Boost Guidance Scale & Strengthen Face Fidelity

## What changes

### 1. Raise `guidance_scale` from 8.5 → 10.0
In `supabase/functions/generate-catalog/index.ts` line 50, change the value. This tells Seedream to follow the prompt more strictly, reducing hallucination drift.

**Important caveat:** Seedream's `guidance_scale` max is typically 10.0. Values above ~9.5 can sometimes cause over-saturation or artifacts. 10.0 is the ceiling — it won't guarantee 100% match but will maximize prompt adherence.

### 2. Add `image_strength` parameter for anchor shots
Seedream supports an `image_strength` parameter (0.0–1.0) that controls how strongly reference images influence the output. Setting it higher (e.g., 0.85 for anchors) forces Seedream to replicate the reference face more faithfully.

### 3. Strengthen negative prompt for face merge prevention
Add an explicit negative prompt block to the Seedream API call. Currently no `negative_prompt` is sent. Adding one with anti-merge directives will actively suppress the hallucination:

```
negative_prompt: "two faces, merged face, blended face, double exposure, 
morphed features, distorted face, two people, split face, composite face, 
ghost face overlay, transparent face, face swap artifact"
```

### 4. Per-phase guidance tuning
- **Anchor shots** (identity lock): `guidance_scale: 10.0` + `image_strength: 0.85` — maximum face fidelity
- **Derivative shots**: `guidance_scale: 9.5` + `image_strength: 0.75` — slightly relaxed to allow pose variation while keeping identity
- **Product-only shots**: `guidance_scale: 8.5` — standard, no face involved

## File to update
- `supabase/functions/generate-catalog/index.ts` — the `generateImageSeedream` function and the caller

## How Seedream face injection actually works (explainer)

Seedream does NOT have a dedicated "face lock" feature. Here's what actually happens:

1. **Reference images** (`body.image`): Seedream treats these as visual context. It tries to reproduce visual elements from them based on prompt instructions.

2. **Prompt correlation**: When the prompt says "the model shown in [MODEL IMAGE]", Seedream maps the first reference image(s) to the person description and tries to replicate facial features.

3. **Why faces merge**: When you send `[model_photo, anchor_result, product]` — both `model_photo` and `anchor_result` contain faces. Seedream averages/blends them because it sees two "person" references. Our previous fix (sending only anchor for derivatives) already addresses this.

4. **Why faces still drift**: Even with one face reference, `guidance_scale: 8.5` gives Seedream 15% creative freedom. At 10.0, it follows the reference more tightly. Adding `negative_prompt` actively suppresses merge artifacts.

5. **The seed trick**: The deterministic seed from `batch_id` helps maintain consistency across shots in the same batch, but it's not a face-lock — it just makes the random noise pattern identical.

