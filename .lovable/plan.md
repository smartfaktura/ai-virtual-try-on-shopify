

## Add Scene Reference Image to Virtual Try-On

### What Changes
The AI will receive the selected scene's preview image as a **third reference**, so it visually matches the environment (lighting, backdrop, mood) while keeping the selected model's identity and appearance unchanged.

### How It Works Today
- Product image and model image are sent as visual references
- Scene is only a short text hint (e.g., "Editorial Minimal") -- the AI guesses the environment

### How It Will Work After
- Product image: AI matches the exact garment
- Model image: AI preserves the person's face and body
- Scene image (NEW): AI replicates the environment, lighting, and composition -- but does NOT take any person/identity cues from it

### Changes

#### 1. Frontend: Send scene image alongside product and model
**File: `src/pages/Generate.tsx`** (~line 607-618)

- Convert `selectedPose.previewUrl` to base64 alongside the product and model images
- Add `sceneImageUrl` to the enqueue payload under `pose`

```
pose: {
  name: selectedPose.name,
  description: selectedPose.promptHint || selectedPose.description,
  category: selectedPose.category,
  imageUrl: base64SceneImage,   // NEW
}
```

#### 2. Frontend hook: Pass scene image for direct calls
**File: `src/hooks/useGenerateTryOn.ts`**

- Add `pose.previewUrl` conversion and send `pose.imageUrl` in the request body (for any non-queue direct calls)

#### 3. Backend: Accept and use scene image as third reference
**File: `supabase/functions/generate-tryon/index.ts`**

Update the `TryOnRequest` interface to include an optional `imageUrl` on the pose object:
```
pose: {
  name: string;
  description: string;
  category: string;
  imageUrl?: string;  // NEW -- scene reference image
}
```

Update `generateImage()` to accept an optional `sceneImageUrl` parameter and include it as a third image in the AI request:
```
content: [
  { type: "text", text: prompt },
  { type: "image_url", image_url: { url: productImageUrl } },   // [PRODUCT IMAGE]
  { type: "image_url", image_url: { url: modelImageUrl } },     // [MODEL IMAGE]
  // Only if scene image provided:
  { type: "image_url", image_url: { url: sceneImageUrl } },     // [SCENE IMAGE]
]
```

Update `buildPrompt()` to reference `[SCENE IMAGE]` when a scene image is available:
- Replace the hardcoded `backgroundMap` text with: "Replicate the environment, lighting, backdrop, and composition from [SCENE IMAGE]"
- Add an explicit instruction: "Use [SCENE IMAGE] ONLY for environment reference. The person's identity must come exclusively from [MODEL IMAGE], NOT from [SCENE IMAGE]."

#### 4. Prompt structure (key section)

When scene image IS provided:
```
3. Photography style:
   - Pose: Editorial Minimal - Model in a clean minimalist setting...
   - Background & Environment: Replicate the environment, lighting, backdrop,
     and composition shown in [SCENE IMAGE]. Match the mood and color palette.
   - IMPORTANT: Use [SCENE IMAGE] ONLY for environment/backdrop reference.
     The person's identity, face, and body MUST come exclusively from [MODEL IMAGE].
     Do NOT take any identity cues from any person visible in [SCENE IMAGE].
```

When scene image is NOT provided (fallback to current text-only behavior):
```
3. Photography style:
   - Background: clean white or light gray professional studio backdrop
```

### Files to Edit
- `src/pages/Generate.tsx` -- convert and send scene image in enqueue payload
- `src/hooks/useGenerateTryOn.ts` -- send scene image for direct calls
- `supabase/functions/generate-tryon/index.ts` -- accept scene image, include as third reference, update prompt
