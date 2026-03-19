

## Root Cause: 429 Fallback Path Skips Database Save

When the primary AI model returns a 429 (rate limit), the code enters the `catch` block and tries a fallback model. If the fallback succeeds, it uploads the image and does `continue` — which **skips the `freestyle_generations` insert** that only exists in the normal `try` path.

This is why the generation "completes" (queue shows `completed` with 1 image) but nothing appears in the gallery — the image exists in storage but has no database record.

From the logs of your last generation:
- Primary model (gemini-3.1-flash-image-preview) hit 429 twice
- Fallback model (gemini-3-pro-image-preview) succeeded
- Image uploaded to storage — but DB insert was skipped due to `continue`

### Fix

**File: `supabase/functions/generate-freestyle/index.ts`** (lines 1157-1161)

After the fallback image is uploaded and pushed to `images[]`, add the same `freestyle_generations` insert logic that exists in the normal path (lines 1102-1128). Then `continue`.

This is a ~25-line addition duplicating the existing insert block into the fallback success path. No other files need changes. The fix is isolated to the `catch (429)` fallback branch.

### Why this is safe
- Only affects the 429 fallback path — the normal generation path is untouched
- Uses the same service-role client and insert logic already proven to work
- The `continue` still fires after the save, preserving loop flow

### Technical Detail
```text
Current flow (broken):
  catch 429 → fallback model → upload → images.push → continue (skips DB save)

Fixed flow:
  catch 429 → fallback model → upload → images.push → DB save → continue
```

