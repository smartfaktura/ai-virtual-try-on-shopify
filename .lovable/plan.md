

# Fix Model Generation — Switch to Native Gemini API

## Problem
The `generate-user-model` edge function uses the **OpenAI-compatible Gemini endpoint** (`/v1beta/openai/chat/completions`) for image generation. This endpoint doesn't properly support `modalities: ["image", "text"]`, so every generation attempt fails silently. The response parsing (`data.choices[0].message.images[0].image_url.url`) also doesn't match the actual response format.

Meanwhile, the working `generate-freestyle` function uses the **native Gemini endpoint** (`/v1beta/models/${model}:generateContent`) which correctly returns images via `candidates[0].content.parts[].inlineData`.

## Fix

### File: `supabase/functions/generate-user-model/index.ts`

**`generateSingleImage` function** — rewrite to use the native Gemini API:

1. **Endpoint**: Change from `/v1beta/openai/chat/completions` to `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
2. **Auth header**: Change from `Authorization: Bearer` to `x-goog-api-key: ${apiKey}`
3. **Request body**: Change from OpenAI format to native Gemini format:
   - `contents: [{ role: "user", parts: [...] }]` instead of `messages`
   - `generationConfig: { responseModalities: ["IMAGE", "TEXT"] }` instead of `modalities`
   - Text parts as `{ text: "..." }` instead of `{ type: "text", text: "..." }`
   - Image parts as `{ inlineData: { mimeType, data } }` or `{ fileData: { fileUri } }` instead of `{ type: "image_url", ... }`
4. **Response parsing**: Extract image from `candidates[0].content.parts[].inlineData` (same pattern as `generate-freestyle`)
5. **Reference images**: Convert image URLs to inline base64 data for the native API, or use `fileData` with the URL

**Also fix the analysis call** (line 213) — this one uses the OpenAI-compatible endpoint for text-only analysis with `gemini-2.5-flash`. This should work but for consistency, switch to the Lovable AI gateway (`ai.gateway.lovable.dev/v1`) with `LOVABLE_API_KEY` for the analysis step, keeping `GEMINI_API_KEY` only for image generation.

### No other files need changes.

## Summary
The root cause is using the wrong API endpoint format. The fix aligns `generate-user-model` with the same native Gemini API pattern already used successfully by `generate-freestyle` and other working edge functions.

