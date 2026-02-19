

## Fix: Label Reference Images So AI Knows Which Is Which

### The Problem
The prompt text says things like "copy pose from [SCENE IMAGE]" and "identity from [MODEL IMAGE]", but the three images are sent as unlabeled blobs in a flat array. The AI has no reliable way to know which image is which, so it defaults to the most prominent person image (the front-facing model) for pose -- ignoring the side-profile scene entirely.

### The Fix
Insert a short text label **before each image** in the content array, so the AI can correctly map `[PRODUCT IMAGE]`, `[MODEL IMAGE]`, and `[SCENE IMAGE]` to the right visuals.

### Changes

**File: `supabase/functions/generate-tryon/index.ts`** (lines ~238-250)

Replace the current unlabeled image array:

```
// Current (broken):
contentParts = [
  { type: "text", text: prompt + negativePrompt },
  { type: "image_url", image_url: { url: productImageUrl } },
  { type: "image_url", image_url: { url: modelImageUrl } },
  // optional:
  { type: "image_url", image_url: { url: sceneImageUrl } },
]
```

With labeled images:

```
// Fixed:
contentParts = [
  { type: "text", text: prompt + negativePrompt },
  { type: "text", text: "[PRODUCT IMAGE]:" },
  { type: "image_url", image_url: { url: productImageUrl } },
  { type: "text", text: "[MODEL IMAGE]:" },
  { type: "image_url", image_url: { url: modelImageUrl } },
  // optional:
  { type: "text", text: "[SCENE IMAGE]:" },
  { type: "image_url", image_url: { url: sceneImageUrl } },
]
```

### Why This Fixes It
- The AI now sees a text label immediately before each image, creating a clear mapping between the prompt instructions and the visual references
- When the prompt says "copy pose from [SCENE IMAGE]", the AI knows exactly which of the three images that refers to
- This is a standard practice in multimodal prompting -- without labels, models often treat the first person-image as the dominant reference

### Files to Edit
- `supabase/functions/generate-tryon/index.ts` -- add text labels before each image in the `generateImage` function content array
- Redeploy the edge function

