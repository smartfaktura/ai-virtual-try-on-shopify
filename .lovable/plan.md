

# Switch Catalog to Native Gemini API (Nano Banana 2, 2K quality)

## What changes

Replace the Lovable AI Gateway call in `generate-catalog` with the native Gemini `generateContent` endpoint — the same pattern used in `generate-freestyle`, `generate-tryon`, and `generate-workflow`.

## Why

- Native API supports `imageConfig.imageSize: "2K"` for higher resolution output
- Native API supports `aspectRatio` as a proper parameter (not just a text hint)
- Matches the proven pattern already working across all other generation functions
- Uses `GEMINI_API_KEY` (already configured in secrets)

## File: `supabase/functions/generate-catalog/index.ts`

### 1. Replace `generateImageNanoBanana` function entirely

Remove the current Lovable AI Gateway implementation (lines 17-104) and replace with native Gemini implementation:

- Add `urlToInlineDataPart()` helper (same as freestyle) — fetches URLs and converts to `{ inlineData: { mimeType, data } }` format
- Add `extractImageFromGeminiResponse()` helper — extracts base64 data URI from native response
- Add content-block detection helpers (`isContentBlocked`, `extractBlockReason`)
- New `generateImageNative()` function that:
  - Converts reference image URLs to `inlineData` parts
  - Calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`
  - Uses `x-goog-api-key` header with `GEMINI_API_KEY`
  - Sets `generationConfig.imageConfig.imageSize = "2K"` and `aspectRatio`
  - Sets `responseModalities: ["IMAGE", "TEXT"]`
  - Returns base64 data URI on success

### 2. Update main handler

- Read `GEMINI_API_KEY` instead of `LOVABLE_API_KEY`
- Map aspect ratio string (e.g. `"4:5"` → native format if needed)
- Call `generateImageNative()` instead of `generateImageNanoBanana()`
- Rest of the flow (storage upload, queue completion) stays identical — it already handles base64

### No other files change

- All face-lock logic, reference image selection, prompt building, queue completion — unchanged
- Hook, types, UI — unchanged

