

## Fix: Product Image Generation Reproducing Reference Instead of Creating New Visuals

### Problem
When a user provides a product reference image (e.g., a ceramic), the AI reproduces the same photo instead of creating a new creative visual. This happens because the prompt engineering instructs the AI to "match the reference image in design, color, and material" — which the model interprets as "reproduce this image."

### Root Cause — 2 locations

**1. `src/pages/Freestyle.tsx` line 301-302** — When no product metadata exists but a source image is provided, the auto-generated prompt is:
```
"Professional photo based on the provided reference image"
```
This is too vague and tells the AI to reproduce the image.

**2. `supabase/functions/generate-freestyle/index.ts` lines 245-260** — The `polishUserPrompt()` function injects:
```
PRODUCT ACCURACY: The product must match the reference image in design, color, and material.
FRAMING: Center the product with balanced negative space...
```
This doubles down on reproduction instead of creative reinterpretation.

### Fix — 2 files

**1. `supabase/functions/generate-freestyle/index.ts`** — Rewrite the product/source image prompt layer

Change the `PRODUCT ACCURACY` block (lines 245-260) to instruct the AI to:
- **Identify** the product from the reference (shape, material, color, brand details)
- **Create a NEW photograph** with fresh composition, angle, and lighting
- **Preserve product identity** (design, colors, proportions) but NOT the photo composition
- When a scene is selected, explicitly place the product in that environment
- When no model is involved, still encourage creative angles and compositions

**2. `src/pages/Freestyle.tsx`** — Improve the auto-prompt for product-only generations (lines 294-303)

When a source image is provided without product metadata, change the fallback prompt from the vague "Professional photo based on the provided reference image" to something that instructs creative reinterpretation:
```
"Create a new professional product photograph featuring the item shown in the reference image.
Use a fresh angle, creative composition, and professional lighting."
```

Also update the condensed multi-reference path (line 130-131) in the backend to use "re-create" language instead of "match" language for the product instruction.

### What Changes in the Prompt

| Before | After |
|---|---|
| "must match the reference image in design, color, and material" | "Identify the product from [PRODUCT IMAGE]. Create a NEW photograph of this exact product with fresh composition and creative lighting" |
| "Center the product with balanced negative space" | "Use a creative angle and professional product photography composition — do NOT replicate the reference photo's angle or framing" |
| "Professional photo based on the provided reference image" | "Create a new professional product photograph of the item shown in the reference image with fresh creative composition" |

### No Schema Changes
This is purely a prompt engineering fix in 2 files.

