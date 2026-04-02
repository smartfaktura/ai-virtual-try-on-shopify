

# Switch Catalog Generation from Seedream to Nano Banana Flash

## Overview

Not hard at all. The current `generate-catalog` function calls BytePlus ARK API (Seedream). We replace that with the Lovable AI Gateway (`google/gemini-3.1-flash-image-preview`), which uses a chat completions API with image modality. The core change is in one file.

## Key Differences

| | Seedream (current) | Nano Banana Flash (new) |
|---|---|---|
| API | BytePlus ARK `/images/generations` | Lovable AI Gateway `/v1/chat/completions` |
| Auth | `BYTEPLUS_ARK_API_KEY` | `LOVABLE_API_KEY` (already configured) |
| Input images | `image` field (URL array) | Multimodal message content (image_url) |
| Output | `data[0].url` | `choices[0].message.images[0].image_url.url` (base64) |
| Aspect ratio | Native `aspect_ratio` param | Text instruction in prompt |
| Image strength | Native `image_strength` param | Not available — prompt-controlled |

## Implementation

### File: `supabase/functions/generate-catalog/index.ts`

1. **Replace `generateImageSeedream` with `generateImageNanoBanana`**
   - Call `https://ai.gateway.lovable.dev/v1/chat/completions`
   - Model: `google/gemini-3.1-flash-image-preview`
   - Auth: `Bearer ${LOVABLE_API_KEY}`
   - Build multimodal messages: text prompt + reference image URLs as `image_url` content parts
   - Request `modalities: ["image", "text"]`
   - Parse base64 image from response

2. **Handle base64 output**
   - Seedream returns a URL; Nano Banana returns base64
   - We already download and re-upload to storage — just decode base64 instead of fetching a URL
   - Convert `data:image/png;base64,...` → `Uint8Array` → upload to `catalog-previews` bucket

3. **Adapt reference image passing**
   - Each reference image becomes an `image_url` content block in the user message
   - Text prompt stays as a `text` content block
   - Aspect ratio instruction embedded in prompt text (e.g., "Output in 4:5 portrait aspect ratio")

4. **Remove Seedream-specific logic**
   - Remove `seedreamAspectRatio()` mapping function
   - Remove `SEEDREAM_MODERATION_CODES` (Lovable AI has its own error handling)
   - Remove `image_strength`, `guidance_scale`, `seed` params (not applicable)
   - Keep negative prompt concepts as text instructions instead

5. **Keep all existing logic intact**
   - Face lock architecture (single-reference for derivatives) stays the same
   - Queue completion, storage upload, error handling all unchanged
   - Reference image selection logic (product-only / anchor / derivative) unchanged

6. **Error handling**
   - Handle 429 (rate limit) and 402 (credits) from gateway
   - Retry on transient failures (same pattern, different status codes)

### No other files change
- `catalogEngine.ts` prompt assembly stays the same
- `useCatalogGenerate.ts` hook stays the same
- Types stay the same

## Why This Should Help with Hallucination

- Nano Banana Flash uses a fundamentally different architecture (multimodal LLM vs diffusion model)
- Reference images are processed as visual context in a conversation, not pixel-blended via `image_strength`
- The model "understands" the prompt and images semantically rather than doing pixel-level interpolation
- Face consistency should improve because the model can reason about "keep this person's face" rather than averaging pixels

