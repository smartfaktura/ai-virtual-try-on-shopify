

# Fix: Model + Scene Realistic Integration

## Problem

When a user uploads an image as "Scene" and selects a model, the generated result looks disjointed — the model doesn't appear naturally placed in the scene. The current prompt instruction for scenes is too generic:

> "SCENE: Use [SCENE REFERENCE] for environment, lighting, atmosphere. Ignore any products in the scene image."

This tells the AI what to reference but not HOW to integrate the model into it realistically.

## Fix

### `supabase/functions/generate-freestyle/index.ts` — `polishUserPrompt()`

Update the SCENE reference instruction (around line 207) to include explicit compositing directives when a model is also present:

**Current:**
```
SCENE: Use [SCENE REFERENCE] for environment, lighting, atmosphere. Ignore any products in the scene image.
```

**New (when model + scene together):**
```
SCENE: Place the person naturally INTO the environment shown in [SCENE REFERENCE]. 
Match the scene's lighting direction, color temperature, and ambient shadows on the person's body and face. 
The person must appear physically present in this space — correct perspective, scale relative to surroundings, 
feet/body grounded on surfaces, consistent shadow direction. Ignore any products or people already in the scene image.
```

When scene is present without a model (product-only), keep the simpler version:
```
SCENE: Use [SCENE REFERENCE] for environment, lighting, atmosphere. Ignore any products in the scene image.
```

### Single file change

- **`supabase/functions/generate-freestyle/index.ts`** — Lines ~206-209: Conditional SCENE prompt based on whether `context.hasModel` is true, adding realistic compositing instructions for model+scene combinations.

