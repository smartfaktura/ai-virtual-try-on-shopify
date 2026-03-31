

## Switch Image Generation to Direct Gemini API

The `GEMINI_API_KEY` is already configured. This is a straightforward URL + key + model-name swap across image generation edge functions.

### What Changes

Every Gemini image generation call currently uses:
```
URL:   https://ai.gateway.lovable.dev/v1/chat/completions
Key:   LOVABLE_API_KEY
Model: google/gemini-3-pro-image-preview  (or google/gemini-3.1-flash-image-preview)
```

Will become:
```
URL:   https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
Key:   GEMINI_API_KEY
Model: gemini-3-pro-image-preview  (or gemini-3.1-flash-image-preview)
```

### Files to Update (Image Generation — swap to direct Gemini)

| File | What changes |
|------|-------------|
| `generate-freestyle/index.ts` | `generateImage()` function URL/key, PROVIDERS registry model names, main handler `LOVABLE_API_KEY` → `GEMINI_API_KEY` for image calls |
| `generate-workflow/index.ts` | `generateWithGemini()` URL/key, `getModelForQuality()` model names |
| `generate-tryon/index.ts` | `generateImageWithModel()` URL/key, model name in `generateWithGeminiPro()` |
| `upscale-image/index.ts` | AI call URL/key |
| `generate-user-model/index.ts` | `generateSingleImage()` URL/key, analysis call stays on Lovable |
| `generate-scene-previews/index.ts` | AI call URL/key, model name |
| `generate-asset-previews/index.ts` | AI call URL/key, model name |
| `generate-style-previews/index.ts` | AI call URL/key, model name |
| `generate-discover-images/index.ts` | AI call URL/key, model name |
| `try-website-shot/index.ts` | Image generation call only (text extraction stays on Lovable) |

### Files That Stay on Lovable AI (text-only, cheap)

- `analyze-product-image` — text analysis
- `classify-scene` — text classification
- `describe-image` — text description
- `describe-discover-metadata` — text metadata
- `studio-chat` — streaming chat
- `create-model-from-image` — text analysis
- `create-scene-from-image` — text analysis
- `analyze-video-input` — text analysis

### Also: Add Response Logging

When Gemini returns no image, log the first 500 chars of the response body so we can debug the "10 second no_image" issue going forward.

### Risk

Low — Google's direct endpoint uses the same OpenAI-compatible format. The `image_config` and response path (`choices[0].message.images[0].image_url.url`) should work identically. If the response structure differs, we'll see it immediately in the new logging.

