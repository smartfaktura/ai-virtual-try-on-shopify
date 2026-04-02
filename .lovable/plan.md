

# Fix Catalog Generation Issues: Sun Flares, Missing Legs, Shadow, Flat Lay Model Leak

## Root Causes Found

### 1. Model image leaks into product-only shots (flat lay shows a person)
In `useCatalogGenerate.ts` line 336, `modelB64` is passed to **every** shot — including flat lay, ghost mannequin, and other `product-only` shots. When Seedream receives a model reference image alongside a "flat lay, no people" prompt, it still renders the person because the image reference overrides the text.

**Fix**: In `useCatalogGenerate.ts`, check `shotDef.needsModel` before passing `modelB64`. For product-only shots, pass `null` instead.

### 2. CONSISTENCY_BLOCK references "same model identity" in product-only shots
The `CONSISTENCY_BLOCK` constant says "same model identity matching the model reference image exactly — same face same hair..." This text gets injected into product-only prompts via `[CONSISTENCY]`, confusing Seedream into adding a person.

**Fix**: Split into two blocks in `catalogEngine.ts`:
- `CONSISTENCY_BLOCK_MODEL` — current text with model identity references
- `CONSISTENCY_BLOCK_PRODUCT` — stripped of all model/person references, focused on product consistency only

Use the appropriate block based on `shotDef.needsModel` in `assemblePrompt`.

### 3. Sun flares / warm lighting bleed
The `BACKGROUND RULE` directive was added in the previous fix, but the `CONSISTENCY_BLOCK` still says "same lighting" without specifying what lighting. When the model's reference photo has warm outdoor lighting, "same lighting" can reinforce it. Also, some lighting presets like `warm_studio_refined` and `soft_warm_luxury` use "golden tones" and "warmth" which can produce sun-flare effects.

**Fix**: Strengthen the `BACKGROUND RULE` directive to explicitly say "NO sun flares, NO window light, NO natural outdoor lighting, ONLY controlled studio lighting." Also add "same STUDIO lighting" instead of just "same lighting" in the consistency block.

### 4. Missing legs (cropping issue)
Some shots produce cropped compositions because the prompt lacks explicit "full body head to toe" framing. The `front_model` template says "full body front-facing pose" but doesn't enforce "head to toe, feet visible."

**Fix**: Add "full body head to toe, feet fully visible in frame" to all full-body on-model shot templates that should show complete figure.

### 5. Ghost mannequin shadow
The ghost mannequin prompt already says "NO shadow" but the `CONSISTENCY_BLOCK` says "same background" which can pull in shadow from other shots. The product-only consistency block will fix this since it won't reference the studio setup used for model shots.

## Files to Change

### 1. `src/hooks/useCatalogGenerate.ts` (~line 333-336)
Pass `null` for model image on product-only shots:
```typescript
const isProductOnlyShot = shotDef.group === 'product-only';
const jobResult = await enqueueJob(
  token, productB64, product.title, product.id, product.imageUrl,
  shotId, shotDef.label, renderPath, prompt,
  isProductOnlyShot ? null : modelB64,  // ← Don't send model ref for product-only
  session.modelProfile, null, batchId, enqueueCount++,
);
```

### 2. `src/lib/catalogEngine.ts`
**a)** Split `CONSISTENCY_BLOCK` into two versions:
- Model version: keeps identity references + "same CONTROLLED STUDIO lighting"
- Product version: "same product appearance, same background, same studio lighting setup, consistent color accuracy across the set"

**b)** In `assemblePrompt`, use `CONSISTENCY_BLOCK_PRODUCT` for product-only shots and `CONSISTENCY_BLOCK_MODEL` for on-model shots by choosing the right block before template replacement.

**c)** Add explicit "NO people, NO model, NO human figure" to flat lay, on-surface, and ghost mannequin templates.

**d)** Add "full body head to toe, feet fully visible" to front_model, back_view, side_3q, movement, walking_motion, full_look templates.

**e)** Strengthen BACKGROUND RULE: add "NO sun flares, NO lens flares, NO window light, NO natural outdoor lighting."

### 3. `supabase/functions/generate-catalog/index.ts`
In the reference images section (~line 360), skip adding model image when `render_path` is `product_only_generate`:
```typescript
if (body.model?.imageUrl && body.render_path !== 'product_only_generate') {
  referenceImages.push(body.model.imageUrl);
}
```

## Summary
Three-layer fix: (1) stop sending model reference images for product-only shots at both client and edge function levels, (2) use a product-focused consistency block without model references, (3) strengthen anti-flare and full-body directives in prompts.

