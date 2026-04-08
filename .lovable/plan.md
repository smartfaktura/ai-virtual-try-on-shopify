

# Add Reference-Image Trigger Blocks for Fragrance Detail Scenes

## What
Add new trigger blocks (e.g. `atomizerDetail`, `openBottle`) that admins can assign to scenes like any other trigger. When a scene with one of these triggers is selected, the Setup step automatically shows a dedicated reference upload box with a clear instruction (e.g. "Upload a close-up of the atomizer nozzle/sprayer").

No database changes needed — triggers are already stored as a text array. This is purely a code-level addition of new trigger definitions and their corresponding UI/prompt handling.

## Trigger Block Definitions

| Trigger key | Upload label | Description shown to user |
|---|---|---|
| `atomizerDetail` | Upload atomizer close-up | Upload a close-up photo of the atomizer/sprayer mechanism so the AI can accurately render it. |
| `openBottle` | Upload open bottle photo | Upload a photo of the bottle with cap removed so the AI knows the exact opening and inner detail. |
| `capDetail` | Upload cap/closure photo | Upload a close-up of the cap or closure mechanism for accurate rendering. |

## Changes

### 1. Define reference trigger config — `detailBlockConfig.ts`
Add a new exported map `REFERENCE_TRIGGERS` that maps trigger keys to their upload label and description text. This is the single source of truth — adding a new reference trigger is just adding one entry here.

### 2. Admin trigger selector — `AdminProductImageScenes.tsx`
The trigger blocks are already editable as a multi-select/input. These new triggers will automatically be available since triggers are free-text. No admin UI changes needed beyond ensuring the new trigger names appear in any autocomplete/chip list if one exists.

Check if there's a predefined trigger list in the admin — if so, add the new keys there.

### 3. Setup step reference uploads — `ProductImagesStep3Refine.tsx`
Replace the single `requires_extra_reference` per-scene upload with a system that checks each selected scene's `triggerBlocks` against `REFERENCE_TRIGGERS`. For each matched trigger across all selected scenes, show a grouped reference upload card (similar to the existing packaging/back-view cards) with the trigger-specific label and description.

The upload stores into `sceneExtraRefs` keyed by trigger name (or scene+trigger), and the generation payload passes it as `extra_reference_image_url` with context.

### 4. Generation payload — `ProductImages.tsx`
When building the job payload, check if the scene has any reference triggers and attach the corresponding uploaded image URL. The existing `extra_reference_image_url` field already handles this — just ensure the right URL is picked per trigger.

### 5. Prompt context — `generate-workflow/index.ts`
When injecting the extra reference image, use the trigger key to provide a meaningful label to the AI model (e.g. `[PRODUCT EXTRA ANGLE: atomizer close-up]` instead of generic `[PRODUCT EXTRA ANGLE]`).

## Files modified
1. `src/components/app/product-images/detailBlockConfig.ts` — add `REFERENCE_TRIGGERS` map
2. `src/pages/AdminProductImageScenes.tsx` — add new triggers to any predefined trigger list
3. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — render trigger-specific upload cards
4. `src/pages/ProductImages.tsx` — pass correct ref URL per trigger
5. `supabase/functions/generate-workflow/index.ts` — use trigger label in prompt injection

