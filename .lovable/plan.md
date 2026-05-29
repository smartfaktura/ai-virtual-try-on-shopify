## Goal
Stop injecting the "PRODUCT REFERENCE ISOLATION — The product reference image shows ..." block into every `/app/generate/product-images` prompt sent to Nano Banana / Gemini.

## Change
**File:** `src/lib/productImagePromptBuilder.ts`
**Line:** 1550–1551

Delete the unconditional append:
```ts
// Product reference isolation — prevent AI from picking up extra garments from the product photo
prompt += ` PRODUCT REFERENCE ISOLATION — The product reference image shows "${product.title}". Focus ONLY on this specific product. Ignore any other garments, clothing items, or accessories visible in the reference photo. The model should wear the product exactly as described, with the outfit specified in the wardrobe note — do NOT reproduce other clothing from the reference image.`;
```

That's it — one block removed. No conditions, no flag, no admin UI. Pure deletion.

## Why this is safe
- The remaining product-fidelity anchors stay intact:
  - CRITICAL #2 ("product MUST look EXACTLY like [PRODUCT IMAGE]")
  - CRITICAL #6 (BACKGROUND ISOLATION — extract only product object)
  - Final `[PRODUCT IMAGE] reproduce ONLY the product object (shape, colors, labels, materials). IGNORE all background, surfaces, and environment` line
- OUTFIT CONSISTENCY (CRITICAL #7) still enforces wardrobe-note matching when a model is present.
- WARDROBE NOTE block (when `wantsPeople === true`) still carries the per-scene outfit spec.

## Out of scope
- No changes to outfit logic, wardrobe note, scene templates, or any other injection.
- No admin panel.
- No conditional gating — just remove.

## Validation
- Generate one jewelry-on-model scene → confirm outfit still respects wardrobe note (other product-fidelity rules should hold the line).
- Generate one still-life (chair / fragrance) → confirm prompt no longer contains the nonsensical "wardrobe note" reference.
