

# Integrate Seedream 4.5 as Alternative Image Generation Provider

## Summary
Add BytePlus ARK Seedream 4.5 as a second image generation provider alongside the existing Gemini models (which you call "Nano Banana"). The architecture will support easy model version swaps (Seedream 5.0+), cross-provider fallback, and an admin-only provider selector in Freestyle.

## Architecture: Provider Abstraction

The key insight is that the two providers have **completely different APIs**:
- **Gemini (Nano Banana)**: Uses Lovable AI Gateway (`ai.gateway.lovable.dev/v1/chat/completions`) with `content` array containing interleaved text + `image_url` items. Returns base64 images in `choices[0].message.images[0].image_url.url`.
- **Seedream**: Uses BytePlus ARK REST API (`ark.ap-southeast.bytepluses.com/api/v3/images/generations`) with `prompt` (string) + `image` (single URL or array of URLs). Returns image URLs in `data[0].url`. Supports `size: "2K"`, `response_format: "url"`, `watermark: false`.

### Provider Config Constant
Create a provider registry at the top of the edge function — a single object mapping provider keys to base URLs, model IDs, and API key env var names. Changing from Seedream 4.5 to 5.0 means changing one model ID string.

```text
PROVIDERS = {
  "nanobanana-flash": { gateway: "lovable", model: "google/gemini-3.1-flash-image-preview" },
  "nanobanana-pro":   { gateway: "lovable", model: "google/gemini-3-pro-image-preview" },
  "seedream-4.5":     { gateway: "ark",     model: "seedream-4-5-251128",  apiKeyEnv: "ARK_API_KEY" },
  // Future: just add "seedream-5.0": { gateway: "ark", model: "seedream-5-0-260128", ... }
}
```

## Changes

### 1. Add `ARK_API_KEY` Secret
Use the `add_secret` tool to request the BytePlus ARK API key from the user. This is required before any Seedream calls can work.

### 2. `supabase/functions/generate-freestyle/index.ts` — Provider Layer

**New function: `generateImageSeedream()`**
- Accepts: `prompt` (string), `imageUrls` (string[]), `size` ("2K"), `model` (string)
- Calls `POST https://ark.ap-southeast.bytepluses.com/api/v3/images/generations` with:
  ```json
  {
    "model": "seedream-4-5-251128",
    "prompt": "...",
    "image": ["url1", "url2"],  // or single string, or omitted for text-only
    "size": "2K",
    "response_format": "url",
    "watermark": false,
    "sequential_image_generation": "disabled"
  }
  ```
- Response: `data[0].url` → returns the URL directly (no base64 upload needed — Seedream returns hosted URLs)
- Retry logic: same pattern as existing `generateImage()` (429 backoff, max 2 retries)
- Returns `string | { blocked: true; reason: string } | null`

**New function: `convertContentToSeedreamInput()`**
- Takes the existing `ContentItem[]` array and extracts:
  - All text items → concatenated into a single `prompt` string
  - All `image_url` items → collected into an `image` array of URLs
- This bridges the gap between the existing prompt-building pipeline and Seedream's flat API

**Modify model selection logic (lines 817-821)**
- Accept a new payload field `providerOverride` (string, optional — e.g. `"seedream-4.5"` or `"nanobanana"`)
- If `providerOverride === "seedream-4.5"`, route to `generateImageSeedream()` instead of `generateImage()`
- The existing prompt building, content array construction, and upload logic remain unchanged

**Cross-provider fallback**
- In the per-image generation loop (line 895+), if the primary provider returns null or throws, fall back to the other provider:
  - If Seedream fails → retry with Nano Banana (existing Gemini)
  - If Nano Banana fails → retry with Seedream (if ARK_API_KEY is configured)
- This replaces the current Pro↔Flash fallback with a more robust cross-provider fallback
- Keep the existing Pro→Flash fallback as an inner fallback within the Gemini path

**Seedream URL handling**
- Seedream returns hosted URLs (not base64), so the upload step needs a branch:
  - If result starts with `data:` → upload via `uploadBase64ToStorage()` (existing)
  - If result starts with `http` → download the image, then upload to Supabase Storage (new helper `downloadAndUploadToStorage()`)
- This ensures all images end up in the `freestyle-images` bucket regardless of provider

### 3. `src/pages/Freestyle.tsx` — Admin Provider Selector

**Add state**: `providerOverride: string | null` (default `null` = auto/existing logic)

**Add admin-only UI**: When `isAdmin` is true, show a small dropdown/chip bar near the generate button:
- Options: "Auto (default)" | "Nano Banana" | "Seedream 4.5"
- Styled as a subtle admin tool (e.g. small badge-like selector with a wrench icon)
- Only visible to admin users via `useIsAdmin()`

**Pass to payload**: Add `providerOverride` to the `queuePayload` object (line 596-620). The enqueue function passes it through to the edge function via `payload`.

### 4. Version Upgrade Path
When Seedream 5.0 releases:
1. Update the `PROVIDERS` constant: change model ID from `seedream-4-5-251128` to `seedream-5-0-260128`
2. That's it — no other code changes needed
3. Optionally add both as separate entries so admin can A/B test

## Files to Modify
- **`supabase/functions/generate-freestyle/index.ts`** — Add `generateImageSeedream()`, `convertContentToSeedreamInput()`, `downloadAndUploadToStorage()`, provider routing logic, cross-provider fallback
- **`src/pages/Freestyle.tsx`** — Add `providerOverride` state, admin-only provider selector chip, pass override in payload

## Key Decisions
- Seedream images are returned as URLs, not base64 — need a download-then-upload step to store in Supabase
- The prompt format stays identical (built by `polishUserPrompt`) — Seedream handles natural language prompts well
- Image references: Seedream uses a flat `image` array (URLs), not interleaved content blocks — the conversion function handles this mapping
- No database changes needed — the provider used is logged in console but not stored (could add a `provider` column to `freestyle_generations` later if needed for analytics)

## Important: Secret Required First
The `ARK_API_KEY` must be configured before implementation can proceed. This is the BytePlus ARK API key from https://console.byteplus.com/ark/region:ark+ap-southeast-1/apikey.

