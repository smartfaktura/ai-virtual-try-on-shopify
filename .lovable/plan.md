
## Fix: Make Selected Model Actually Appear in Generated Images

### The Problem
When you select a model like Charlotte, her reference image is sent to the AI but the images arrive as an unlabeled flat array. The AI sees 3 images and a text prompt but doesn't know which image is the product, which is the person to replicate, and which is the scene. The text only says "Model reference: female, athletic build, European" -- which is a generic description, not an instruction to use that exact person.

### The Fix

Update the **edge function** (`supabase/functions/generate-freestyle/index.ts`) to:

**1. Label each image inline with text**

Instead of passing images as:
```text
[text prompt] [image] [image] [image]
```

Structure the multimodal content array as:
```text
[text prompt]
[text: "PRODUCT REFERENCE IMAGE:"] [product image]
[text: "MODEL REFERENCE — replicate this exact person:"] [model image]
[text: "SCENE/ENVIRONMENT REFERENCE:"] [scene image]
```

This way the AI knows exactly what each image represents.

**2. Add strong face/identity fidelity instructions**

Update the `polishUserPrompt` function's model section from the current generic:
> "PORTRAIT QUALITY: Natural and realistic skin texture..."

To an explicit identity-matching instruction:
> "MODEL IDENTITY: The generated person MUST be the exact same person shown in the model reference image. Replicate their exact face, facial features, skin tone, hair color, hair style, and body proportions. This is a specific real person -- do not generate a different person who merely shares the same gender or ethnicity."

**3. Restructure the `generateImage` function**

Change the signature to accept labeled image groups instead of a flat array, so each image is preceded by its role label in the content array sent to the AI.

### Technical Changes

**File: `supabase/functions/generate-freestyle/index.ts`**

- Modify `generateImage()` to accept a structured content array instead of separate prompt + images parameters
- Build the content array in the request handler with interleaved text labels and images:
  - `"PRODUCT/SOURCE REFERENCE IMAGE (reproduce this product exactly):"` before source image
  - `"MODEL REFERENCE IMAGE (use this exact person's face, hair, body, and skin tone):"` before model image
  - `"SCENE/ENVIRONMENT REFERENCE IMAGE (match this setting and lighting):"` before scene image
- Update the polish function's model block to include strong identity-matching language
- Add `modelContext` details (gender, build, ethnicity) directly into the model label for reinforcement

### No Frontend Changes Needed
The frontend already sends all the correct data. This is purely a backend prompt engineering fix in the edge function.
