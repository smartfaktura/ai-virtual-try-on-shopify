

# Fix: Switch to Native Gemini generateContent Endpoint

## Problem
The OpenAI-compatible endpoint (`/v1beta/openai/chat/completions`) returns `HTTP 400: "Unhandled generated data mime type: image/jpeg"`. Google's compatibility layer cannot serialize generated images back into the OpenAI response format. This is a fundamental limitation of this endpoint — not a parameter issue.

## Solution
Switch to the native Gemini `generateContent` endpoint which returns generated images directly as base64 in `inlineData`.

## Changes per function

Each affected function gets the same transformation:

### 1. URL
```
OLD: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
NEW: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

### 2. Auth header
```
OLD: Authorization: Bearer {key}
NEW: x-goog-api-key: {key}
```

### 3. Request body
```
OLD: { model, messages: [{role:"user", content:[...]}], modalities:["image","text"], max_tokens:8192 }

NEW: { contents: [{ role:"user", parts: [...] }],
       generationConfig: { responseModalities:["IMAGE","TEXT"],
                           imageConfig: { aspectRatio:"3:4" } } }
```

Content parts mapping:
- `{type:"text", text:"..."}` → `{text:"..."}`  
- `{type:"image_url", image_url:{url:"data:image/...;base64,XXX"}}` → `{inlineData:{mimeType:"image/png", data:"XXX"}}`
- For URL-based images: fetch and convert to base64 first

### 4. Response parsing
```
OLD: data.choices[0].message.images[0].image_url.url  (already a data: URI)
NEW: candidates[0].content.parts[] → find part with inlineData → construct "data:{mimeType};base64,{data}"
```

## Files affected

1. **`generate-freestyle/index.ts`** — `generateImage()` function (lines 690-757)
   - Transform URL, headers, body, response parsing
   - Remove the aspect ratio hint prepending (move back to `imageConfig`)
   - Handle URL-to-base64 conversion for input images

2. **`generate-workflow/index.ts`** — image generation call
   - Same pattern

3. **`generate-tryon/index.ts`** — image generation call  
   - Same pattern, also has image inputs

4. **`generate-workflow-preview/index.ts`** — image generation call
   - Same pattern

## Input image handling
The native endpoint requires `inlineData` (base64) instead of URL references. For image inputs currently passed as URLs:
- Fetch the image URL → read as ArrayBuffer → convert to base64
- Add a helper function `urlToBase64Part()` shared across the affected code

## Rollout
1. Update `generate-freestyle` first (best logging)
2. Test one generation, confirm `nanobanana → ok`
3. Update remaining 3 functions
4. Seedream fallback remains untouched as safety net

