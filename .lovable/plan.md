

# Fix: Inconsistent On-Model Generations (Cut Legs, Mixed Outfits, Background Bleed)

## Problems Identified

1. **Cut-off legs / head-only crops**: The `apparel_on_model_editorial` template says "showing fit, silhouette, and drape" but gives zero body framing guidance. The AI randomly picks head-shot, half-body, or 3/4 crops.

2. **Inconsistent outfits across batch**: Each scene job is dispatched independently. The `defaultOutfitDirective` for garments says "clean, complementary styling...neutral tones" — too vague. One generation picks brown trousers, another picks jeans. There is no "outfit DNA" shared across the batch.

3. **Product reference background leaking**: No instruction tells the AI to ignore the background of the uploaded product photo. The AI sees the product's original background (e.g., beige/brown studio) and reproduces it.

## Plan

### File 1: `src/lib/productImagePromptBuilder.ts`

**A. Add garment body-framing instruction to on-model scenes**

Add a new `bodyFramingDirective` token that resolves based on `sceneType` and category:
- For garments + portrait/editorial scenes: "Full-body shot — model visible from head to toe, feet fully inside frame, natural standing pose."
- For bags/shoes + portrait: "Three-quarter shot — model visible from head to mid-thigh."
- For beauty/fragrance + portrait: "Close-up beauty shot — shoulders and face."

Inject this into any template containing `personDirective` if the word "body" or "full" isn't already present.

**B. Lock outfit across batch with deterministic outfit description**

Create a `buildLockedOutfitDirective(category, productTitle)` that returns a specific, deterministic outfit instead of vague guidance:
- Garments: "Wearing slim-fit light beige cotton trousers and minimal white sneakers — same outfit in every shot."
- Bags: "Wearing a fitted black turtleneck, slim dark navy trousers, and black ankle boots — same outfit in every shot."
- Shoes: "Wearing cropped slim dark denim and a plain white tee — same outfit in every shot."

Replace the current vague `defaultOutfitDirective` with this locked version. The key addition is the explicit "same outfit in every shot" instruction.

**C. Add product-background isolation instruction**

Add a `REFERENCE_ISOLATION` constant:
```
"CRITICAL: The [PRODUCT IMAGE] is a reference for the product ONLY. 
Completely IGNORE its background, lighting, and environment. 
Generate the product in the new scene/background described above."
```

Append this to every resolved prompt in `buildDynamicPrompt` before the quality suffix.

**D. Add negative prompt for background bleed**

Expand `PRODUCT_NEGATIVES` to include: "no background from reference image, no original product photo environment."

### File 2: `src/components/app/product-images/sceneData.ts`

**E. Update `apparel_on_model_editorial` template**

Add `{{bodyFramingDirective}}` token and explicit full-body instruction:
```
'On-model fashion photograph — {{productName}} worn by model. 
{{bodyFramingDirective}} {{personDirective}} {{outfitDirective}} ...'
```

**F. Update `apparel_motion_scene` template similarly**

Add `{{bodyFramingDirective}}` to the motion shot template.

### File 3: `src/pages/ProductImages.tsx`

**G. Pass batch context to payload**

Add `batch_outfit_lock: true` and `batch_size: selectedScenes.length` to the payload so the backend prompt builder knows this is a multi-scene batch that needs visual consistency.

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/productImagePromptBuilder.ts` | Add bodyFramingDirective, locked outfit defaults, reference isolation block, expanded negatives |
| `src/components/app/product-images/sceneData.ts` | Add `{{bodyFramingDirective}}` to 2 garment on-model templates |
| `src/pages/ProductImages.tsx` | Pass batch consistency metadata in payload |

