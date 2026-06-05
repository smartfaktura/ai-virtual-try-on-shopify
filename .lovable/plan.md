## Root cause
The chair in "Anthony 7 Mocca" was re-invented because the model is treating the **swatch** as the primary subject and the **chair photo** as soft "reference". The edge function `generate-freestyle` labels the slots like this when `isPerspective=true`:

1. `productImage` → text label `[PRODUCT REFERENCE]` (treated as the subject)
2. `referenceAngleImage` → text label `[REFERENCE IMAGE]` (treated as a hint)

Today `useMaterialSwap.ts` deliberately inverts the slots:
- `productImage` = material swatch
- `referenceAngleImage` = chair photo

So the model sees the swatch as the product and the chair as just a vibe reference — it freely re-imagines the chair geometry, scene, and lighting. This matches the Mocca screenshot.

## Fix — swap the slot mapping back

### `src/hooks/useMaterialSwap.ts`
1. **Flip the payload slots** in the per-material loop:
   - `productImage: productAnchorBase64`  (the chair photo — primary subject)
   - `referenceAngleImage: materialBase64` (the swatch — material source)
   - Update the explanatory comment above the payload to reflect the new mapping.

2. **Rewrite `buildMaterialSwapPrompt`** so its label references match what the edge function actually emits:
   - Refer to the chair as **`[PRODUCT REFERENCE]`** everywhere (was `[REFERENCE IMAGE]`).
   - Refer to the swatch as **`[REFERENCE IMAGE]`** / "the second image" (was "first image").
   - Open with: `Re-render the EXACT product shown in [PRODUCT REFERENCE]. Only re-skin its upholstered / skinnable surfaces using the material sampled from [REFERENCE IMAGE] ("${materialLabel}"). Treat [PRODUCT REFERENCE] as the absolute source of truth for geometry, scene, framing, lighting, and any people. Treat [REFERENCE IMAGE] as a material sample only — never import its scene, background, lighting, or composition.`
   - Keep the existing `SCENE & PRODUCT FIDELITY`, `SWATCH ANALYSIS`, `TARGET SURFACES`, `PHYSICAL REALISM`, `NEGATIVES` blocks but update internal wording so "first image" → `[REFERENCE IMAGE]` and "reference" → `[PRODUCT REFERENCE]`.
   - Add one more negative: `Do NOT redesign, restyle, or substitute the product. If you cannot identify a clearly upholstered surface to apply a soft material, leave geometry untouched.`

### `mem://features/material-swap`
Update the memory: remove the "deliberate inverse of Product Swap" language and document the corrected mapping (`productImage` = product anchor; `referenceAngleImage` = swatch). Also note the prompt labels (`[PRODUCT REFERENCE]` = anchor, `[REFERENCE IMAGE]` = swatch).

## Out of scope
- UI, success page, pricing, edge function, polling, lightbox, materials step UX.
- No fallback / model changes — same Pro → Seedream → Flash chain.
