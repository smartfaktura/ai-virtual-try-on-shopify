

# Fix: Background Bleed, Outfit Inconsistency, and Cut-off Framing

## Root Cause Analysis

Three issues visible in the latest generation:

1. **Background bleed (beige bg everywhere)**: The `REFERENCE_ISOLATION` instruction is appended at the END of the client-side prompt inside `variation.instruction`. But the backend wraps this in a much larger prompt with CRITICAL REQUIREMENTS. The AI model sees the beige background in [PRODUCT IMAGE] and reproduces it because the isolation instruction is buried — the AI gives more weight to what it SEES than what it READS when the text instruction is weak/late.

2. **Outfit inconsistency (one image dark pants, another beige)**: The `batch_outfit_lock: true` flag is sent to the backend but **the backend completely ignores it**. The outfit lock text only exists inside the client-side prompt as inline text. The AI model doesn't prioritize it because it's not in the backend's numbered CRITICAL REQUIREMENTS section.

3. **Cut-off body**: The `bodyFramingDirective` was added to only 2 specific templates (`apparel_on_model_editorial`, `apparel_motion_scene`). Other scenes that involve people don't get it. The auto-inject at the bottom checks for "body framing" keyword but many on-model prompts don't trigger person-type scenes consistently.

## Plan

### File 1: `supabase/functions/generate-workflow/index.ts`

The backend prompt builder (`buildVariationPrompt`) needs to read and enforce batch consistency at the CRITICAL REQUIREMENTS level — where the AI model actually pays attention.

**A. Read `batch_outfit_lock` from body and inject into CRITICAL REQUIREMENTS:**

Add a new parameter to `buildVariationPrompt` for batch context. When `batch_outfit_lock` is true, append to the numbered CRITICAL REQUIREMENTS:

```
7. OUTFIT CONSISTENCY (CRITICAL): If a person/model appears, they MUST wear the EXACT same outfit described in the variation instruction. Do NOT deviate — same colors, same garment types, same shoes. This is a multi-image batch and visual consistency across all shots is mandatory.
```

**B. Elevate reference isolation to CRITICAL REQUIREMENTS:**

Move the reference isolation instruction from buried inline text to a numbered CRITICAL REQUIREMENT:

```
8. BACKGROUND ISOLATION (CRITICAL): The [PRODUCT IMAGE] shows the product ONLY. You MUST completely IGNORE the background, environment, and lighting visible in [PRODUCT IMAGE]. Generate ONLY the new background/environment described in the variation instruction above. The product's original photo background must NOT appear in the output.
```

**C. Pass batch context through the function call chain:**

Read `body.batch_outfit_lock` and `body.batch_size` and pass to `buildVariationPrompt`. Add the new critical requirements conditionally.

### File 2: `src/lib/productImagePromptBuilder.ts`

**D. Move `REFERENCE_ISOLATION` from end-of-prompt to beginning:**

Currently appended after cleanup at line 737. Move it to be injected right after the template resolution (before auto-inject block), so it appears early in the `variation.instruction` text that the backend receives.

**E. Strengthen background instruction in all on-model templates:**

The `injectIfMissing('background', 'background')` auto-inject should produce a stronger directive for garment scenes. Update `defaultBackground('garments')` to include explicit "NOT the reference image background":

```
'soft warm white seamless studio background — do NOT reproduce the background from the product reference photo'
```

### File 3: `src/components/app/product-images/sceneData.ts`

**F. Add `{{bodyFramingDirective}}` to ALL garment on-model scenes:**

Check every scene in the garments category that has `personDetails` or `actionDetails` in triggerBlocks and add `{{bodyFramingDirective}}` if missing. Also apply to universal scenes like `in-hand-studio`, `in-hand-lifestyle` where garments might be shown.

## Files to Update

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | Read batch_outfit_lock, add outfit consistency + background isolation to CRITICAL REQUIREMENTS |
| `src/lib/productImagePromptBuilder.ts` | Move REFERENCE_ISOLATION to beginning of prompt, strengthen default backgrounds |
| `src/components/app/product-images/sceneData.ts` | Add bodyFramingDirective to all on-model garment scenes |

