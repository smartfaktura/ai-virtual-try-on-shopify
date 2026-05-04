## Scene-Level Half Portrait Framing Control

Instead of hardcoding framing by garment type, add a new scene-level trigger block `halfPortrait` that admins can toggle per scene. When active, it:
- Changes body framing to three-quarter (head to mid-thigh)
- Suppresses shoes from the outfit directive so the AI doesn't try to show full-body

### Changes

**1. Add `halfPortrait` to trigger blocks** (`src/components/app/product-images/detailBlockConfig.ts`)
- Add `'halfPortrait'` to the `ALL_TRIGGER_KEYS` array so it appears as a checkbox in the admin scene editor

**2. Update `resolveBodyFramingDirective`** (`src/lib/productImagePromptBuilder.ts`)
- Add a new parameter: the scene's `triggerBlocks` array
- If `triggerBlocks` includes `halfPortrait`, return: "Three-quarter shot — model visible from head to mid-thigh, product is the focal point. Do NOT force a full-body head-to-toe shot."
- This overrides the category-based default framing
- Update the call site at the `bodyFramingDirective` token case (~line 1069) to pass `scene.triggerBlocks`

**3. Suppress shoes in outfit when `halfPortrait` is active** (`src/lib/productImagePromptBuilder.ts`)
- In `defaultOutfitDirective` (and the auto-inject outfit block ~line 1387): when the scene has `halfPortrait` trigger, add `'shoes'` to the `skipSlots` set so shoes are never mentioned in the outfit prompt
- This prevents the AI from interpreting outfit shoes as a cue to show a full-body shot

**4. Product reference isolation** (`src/lib/productImagePromptBuilder.ts`)
- Near the end of `buildPrompt` (around where SCENE REFERENCE is appended, ~line 1456): when a product reference image is provided, add a directive: "PRODUCT REFERENCE ISOLATION — Focus ONLY on the named product from the reference image. Ignore any other garments or items visible in the reference photo."
- This prevents the AI from picking up shorts/other clothing from the product photo

### Admin workflow
After deployment, you can go to the scene library and toggle the `halfPortrait` trigger on any on-model scene where you want portrait-style framing instead of full-body. No code changes needed per scene — it's all data-driven.
