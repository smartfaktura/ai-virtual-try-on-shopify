

# Rethink Anchor Strategy: Style Transfer Instead of Face Injection

## Core Insight

Current approach sends the model photo as a "face reference" and hopes Seedream replicates it. This causes merged faces because Seedream treats all reference images as visual context to blend.

**New approach** (proven to work): Use Seedream's style-transfer capability. The prompt explicitly tells Seedream:
- **Image 1** (model photo) = the person whose face/hair/identity to KEEP
- **Image 2** (anchor result or product) = the style/pose/clothes/lighting to APPLY

This is the "Apply style of Image 2 to Image 1" paradigm — clear attribute segregation prevents face merging.

## What Changes

### 1. Rewrite the prompt strategy in `src/lib/catalogEngine.ts`

**Anchor shot prompt** (identity_anchor):
Instead of: "Model wearing product, replicate face..."
New: "Apply the clothing shown in [PRODUCT IMAGE] onto the person in [MODEL IMAGE]. Maintain the exact facial features, hair, and skin of the person in [MODEL IMAGE]. Use the outfit, fit, and styling from [PRODUCT IMAGE] only."

**Derivative shot prompts** (all on-model):
Instead of: generic template + model identity anchor block
New: "Apply the style, lighting, pose described below to the person in [REFERENCE IMAGE], maintaining their exact facial features and hair. The person wears [PRODUCT]..."

### 2. Change reference image ordering in `generate-catalog/index.ts`

**Anchor phase** (currently: `[model, model, product]`):
New: `[model, product]` — model FIRST as the identity source (Image 1), product SECOND as the style source (Image 2). No need to send model twice — the prompt now explicitly separates roles.

**Derivative phase** (currently: `[anchor_result, product]`):
Keep as-is but change the prompt to explicitly say "maintain the face/hair of the person in Image 1" (the anchor result already has the correct face locked).

### 3. Replace the MODEL IDENTITY ANCHOR block in `assemblePrompt()`

Current block (lines 798-803) says "replicate face structure, jawline..." — this is a description-based approach that Seedream ignores in favor of visual blending.

New block uses **explicit image-role assignment**:
```
IMAGE ROLE ASSIGNMENT:
- [MODEL IMAGE] (Image 1): This is the IDENTITY SOURCE. Maintain this person's 
  exact face, hair color, hair style, skin tone, and body proportions.
- [PRODUCT IMAGE] (Image 2): This is the STYLE SOURCE. Apply ONLY the clothing/product 
  from this image onto the person from Image 1.
Do NOT blend the faces. Do NOT average features between images.
The output person must be IDENTICAL to the person in Image 1.
```

### 4. Adjust `image_strength` for the new paradigm

- **Anchor**: Lower `image_strength` from 0.85 → 0.70. We want Seedream to follow the prompt's role assignment more than raw pixel blending.
- **Derivatives**: Keep 0.75 — the anchor already has the correct face, so higher reference fidelity is fine.

## Files to update
- `src/lib/catalogEngine.ts` — Replace MODEL IDENTITY ANCHOR block with image-role-assignment paradigm; update identity_anchor prompt template
- `supabase/functions/generate-catalog/index.ts` — Change anchor reference array from `[model, model, product]` to `[model, product]`; adjust `image_strength`

## Expected result
- Seedream receives clear instructions: "this image = face, that image = outfit"
- No face merging because the prompt explicitly forbids blending
- Model face stays sharp and consistent because it's treated as the immutable identity source
- Anchor locks the outfit-on-face combination; derivatives extend it to different poses

