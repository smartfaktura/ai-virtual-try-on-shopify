

# Investigation Results: Last Generation Used Seedream (Not Gemini Direct)

## What Happened

The latest generation (job `4757b466`) shows the **new code IS deployed** — the model string is `gemini-3-pro-image-preview` (no `google/` prefix), confirming the direct Gemini API code is live.

However, the direct Gemini API call **failed instantly** (0.0s) with `server_error`, so the fallback chain kicked in and used Seedream instead:

```text
Attempt 1: nanobanana/gemini-3-pro-image-preview → server_error (0.0s)
Fallback:  nanobanana → seedream
Attempt 2: seedream/seedream-4-5-251128 → ok (14.7s)
```

## Root Cause

The `generateImage()` function calls `generativelanguage.googleapis.com` with the `GEMINI_API_KEY`, but the error response body is **not logged** — only the failure type (`server_error`) is recorded. The 0.0s duration means Google's API rejected the request immediately, which typically means:
- The API key may be invalid or misconfigured for the image generation endpoint
- The `image_config` parameter (aspect_ratio, image_size) may not be supported by the direct API
- A permission/quota issue on the Google Cloud project

## Plan

### Step 1: Add error logging to the Gemini direct call
In `generateImage()` (line ~725-727), the raw error text IS captured but never printed. Add a `console.error` so we can see the actual Google API error:

```typescript
// Line 725-727: after capturing errorText
console.error(`[nanobanana] ${model} HTTP ${response.status}: ${errorText.slice(0, 500)}`);
```

### Step 2: Redeploy generate-freestyle
Deploy the updated function so the next failed attempt logs the actual error from Google.

### Step 3: Trigger a test generation
Run one freestyle generation to see the actual error message, then fix accordingly.

**Likely fixes depending on the error:**
- If 400 Bad Request: the `image_config` field may need to be removed or renamed for the direct API
- If 401/403: the `GEMINI_API_KEY` needs to be verified/regenerated
- If quota error: the Google Cloud project needs image generation API enabled

## Technical Details

The function at `supabase/functions/generate-freestyle/index.ts` line 690-728 makes the direct API call. The error path captures `errorText` but only returns it in the result object — it's never logged to console. The fallback orchestrator (line 889) only logs `result=server_error` without the raw error details.

