

## Why the Timeout Happened

From the logs, the freestyle generation used `google/gemini-3-pro-image-preview` with a source image + model image (high quality, pro camera). The AI gateway call timed out on **both attempts** (the function retries twice after the first failure).

**Root cause**: The `generateImage` function uses a **90-second timeout** per AI call (`AbortSignal.timeout(90_000)`). Pro image generation models with multiple input images (source + model + scene) regularly take 90-120+ seconds, especially under load. With `maxRetries = 2`, all 3 attempts can time out, consuming ~270s of the edge function's ~300s wall clock — and still failing.

**Why retries don't help here**: If the AI model is genuinely slow (not a transient error), retrying with the same 90s timeout will fail identically each time, just wasting time.

---

## Plan to Prevent Timeouts

### 1. Increase timeout for pro model calls (`generate-freestyle/index.ts`)
- Change the `AbortSignal.timeout` from **90s to 150s** for pro models (`gemini-3-pro-image-preview`, `gemini-3.1-pro-preview`)
- Keep 90s for standard/flash models which are faster
- Pass the model name into `generateImage` so it can pick the right timeout

### 2. Reduce retries for timeout errors specifically
- When the error is a `TimeoutError`, retry only **once** (not twice) — a second 150s attempt still fits within the edge function's wall clock
- Keep 2 retries for other transient errors (500s, no-image responses)

### 3. Better user-facing error message on timeout
- Currently the user sees a generic "failed" message
- Update the catch block to detect `TimeoutError` and set a specific error message: *"Generation timed out — the AI model took longer than expected. This can happen with complex prompts or multiple reference images. Please try again."*
- This message will appear in the job's `error_message` field and propagate to the UI

### Files Modified

| File | Change |
|---|---|
| `supabase/functions/generate-freestyle/index.ts` | Dynamic timeout (150s pro / 90s standard), smarter retry for timeouts, descriptive error message |

