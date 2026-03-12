

## Fix Upscale Worker: Missing `modalities` Parameter + Quality Improvements

### Root Cause

The last upscale job **failed** with "No image returned from AI model". The edge function logs confirm:
```
ERROR: No image returned from AI model
```

The API call to Gemini 3 Pro Image is **missing the `modalities: ["image", "text"]` parameter**. Without this, the model returns text-only content — no image is ever generated. This is why the result is either a failure or a tiny low-quality file.

### Changes

**1. `supabase/functions/upscale-worker/index.ts`** — Fix the API call

Add `modalities: ["image", "text"]` to the request body (line ~91-103). This is **required** by the Gemini image generation models to actually produce an image output. Without it, the model only returns text.

```typescript
body: JSON.stringify({
  model: "google/gemini-3-pro-image-preview",
  modalities: ["image", "text"],  // <-- MISSING, causes "No image returned"
  messages: [ ... ],
}),
```

Also switch to `google/gemini-3.1-flash-image-preview` (Nano Banana 2) which is faster and produces pro-level quality — better suited for reproduction tasks than the slower Pro model.

**2. Improve the prompt** — The current prompt asks the model to "reproduce at X pixels" which is vague for a generative model. Refine to emphasize exact pixel-for-pixel reproduction with maximum output quality, and explicitly request PNG output format for lossless quality.

### Files Changed — 1 file
- `supabase/functions/upscale-worker/index.ts` — Add `modalities` parameter, switch to flash-image model, refine prompt

