

## Fix: Scene reference bleeding products into generation

### Problem
When a user selects a scene reference image that contains products (e.g., a skincare scene with a serum bottle), the AI reproduces those scene products alongside the user's actual product (the ring). This happens because:

1. **Layered path** (line 387): The scene instruction says "Reproduce the same location, background elements, **props**..." — "props" includes other products visible in the scene
2. **Condensed path** (line 196): The scene instruction is too vague: "Use [SCENE IMAGE] as the environment" — doesn't explicitly exclude products from the scene

### Fix

**File: `supabase/functions/generate-freestyle/index.ts`**

1. **Layered path** (line 385-388) — Update the ENVIRONMENT instruction to explicitly exclude any products/items from the scene and only use it for background, lighting, and atmosphere:

```
"ENVIRONMENT: Place the subject in the EXACT environment shown in the SCENE REFERENCE IMAGE. 
Reproduce the same location, background architecture, foliage, surfaces, and atmosphere. 
Match the lighting direction, color temperature, and time of day. 
CRITICAL: If the scene image contains any products, bottles, accessories, or commercial items, 
IGNORE them completely — do NOT reproduce them. The ONLY product in the final image must be 
the one from [PRODUCT IMAGE]. Use the scene ONLY for its environment, setting, and mood."
```

2. **Condensed path** (line 196) — Strengthen the scene instruction to also exclude scene products:

```
"SCENE: Use [SCENE IMAGE] for environment, lighting, and atmosphere ONLY. 
If the scene contains any products or commercial items, IGNORE them — 
the ONLY product in the image must be from [PRODUCT IMAGE]."
```

### Summary
Two line changes in one file. No database or frontend changes needed.

