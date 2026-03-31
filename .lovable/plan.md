

# Risk Assessment & Migration Plan: Switch to Native Gemini API

## How serious is this change?

**Risk level: Medium** — The change is well-understood and well-documented, but it touches your core money-making functions (image generation). Here's the honest breakdown:

### What's safe
- The fix is the **same pattern** across all affected functions — not unique logic per file
- Your **fallback system to Seedream still works** — if anything goes wrong, images still generate (just via Seedream, like they do now)
- The Google native API is well-documented and confirmed working with `imageConfig`, `aspectRatio`, and `imageSize`
- Only **4 lines change per function** (URL, auth header, request body structure, response parsing)

### What could go wrong
- A typo in the new request/response format could break the primary Gemini path (but Seedream fallback catches it)
- If `GEMINI_API_KEY` doesn't have access to the native `generateContent` endpoint (unlikely but possible)
- Response parsing mismatch (native returns `candidates[0].content.parts[].inlineData` instead of `choices[0].message.images[0]`)

### Worst case scenario
- Gemini direct still fails → Seedream fallback kicks in → **exactly what happens today**. No worse than current state.

## Backup

You already have a built-in backup — Lovable's version history. You can revert to the current working state at any time by clicking the revert button below any previous chat message, or using the History tab.

## What changes (4 functions)

Each function gets the same 4-part change:

1. **URL**: `/v1beta/openai/chat/completions` → `/v1beta/models/{model}:generateContent`
2. **Auth**: `Authorization: Bearer {key}` → `x-goog-api-key: {key}` header
3. **Request body**: OpenAI format → Native Gemini format:
```text
OLD:
  { model, messages: [...], modalities: ["image","text"], image_config: {...} }

NEW:
  { contents: [{ parts: [...] }], generationConfig: { responseModalities: ["IMAGE","TEXT"], imageConfig: { aspectRatio, imageSize } } }
```
4. **Response parsing**: `choices[0].message.images[0].image_url.url` → `candidates[0].content.parts[].inlineData.data`

### Files affected
- `supabase/functions/generate-freestyle/index.ts` — `generateImage()` function (lines 690-750)
- `supabase/functions/generate-workflow/index.ts` — image generation call (lines 646-668)
- `supabase/functions/generate-tryon/index.ts` — image generation call (lines 428-450)
- `supabase/functions/generate-workflow-preview/index.ts` — image generation call (lines 78-107)

### NOT affected
- Seedream fallback logic (untouched)
- Text analysis functions (stay on Lovable AI gateway)
- All other preview functions that use Lovable AI gateway
- Frontend code (no changes)
- Database (no changes)

## Deployment plan (safe rollout)
1. Update `generate-freestyle` first (has the best error logging already)
2. Deploy and test one generation
3. Check logs — confirm `nanobanana → ok` instead of `server_error`
4. If successful, update the other 3 functions
5. If it fails, revert via history — Seedream fallback keeps everything working meanwhile

