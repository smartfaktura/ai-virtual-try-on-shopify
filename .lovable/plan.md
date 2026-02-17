

## Fix: Virtual Try-On Aspect Ratio Not Being Enforced

### Root Cause

The `generate-freestyle` edge function correctly passes `image_config: { aspect_ratio: "9:16" }` as an API parameter to the AI gateway, which forces the output image dimensions. However, the `generate-tryon` edge function only mentions the aspect ratio in the **prompt text** (e.g., "IMAGE FORMAT: Portrait orientation (9:16 aspect ratio)"). The AI model ignores text-based size instructions and defaults to 1:1 square output.

This is confirmed by the edge function logs: job `beac4b26` has `aspectRatio: "9:16"` in its payload and the prompt says "Portrait orientation (9:16)", but the generated images came out square.

### Fix

**`supabase/functions/generate-tryon/index.ts`** -- Add `image_config` parameter to the AI API call

In the `generateImage` function (around line 227), add the `image_config` parameter with the aspect ratio, matching the pattern already used in `generate-freestyle`:

```typescript
// Current (broken):
body: JSON.stringify({
  model: "google/gemini-2.5-flash-image",
  messages: [...],
  modalities: ["image", "text"],
})

// Fixed:
body: JSON.stringify({
  model: "google/gemini-2.5-flash-image",
  messages: [...],
  modalities: ["image", "text"],
  image_config: { aspect_ratio: aspectRatio },
})
```

This requires passing the `aspectRatio` string into the `generateImage` function. The function signature changes from:

```text
generateImage(prompt, productImageUrl, modelImageUrl, apiKey)
```

to:

```text
generateImage(prompt, productImageUrl, modelImageUrl, apiKey, aspectRatio)
```

And the call site (line 401) passes `body.aspectRatio || "1:1"` as the new argument.

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-tryon/index.ts` | Add `aspectRatio` parameter to `generateImage` function and include `image_config: { aspect_ratio }` in the API request body |

### Why This Will Work

The `generate-freestyle` function already uses this exact pattern successfully. The `image_config` parameter is a native API feature that forces the AI model to output images in the requested dimensions, rather than relying on prompt-text instructions which models often ignore.

