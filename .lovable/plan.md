

## Fix: Use Fast AI Model for Freestyle (Match Try-On)

### Root Cause

Freestyle auto-upgrades to `google/gemini-3-pro-image-preview` when there are 2+ reference images (line 579). This slow model with 3 images + a long prompt consistently exceeds the 50s timeout. Try-On always uses `google/gemini-2.5-flash-image` and works fine.

### Solution

Use `gemini-2.5-flash-image` as the default model for freestyle, matching try-on. Only use the pro model when the user explicitly selects "high" quality AND there are fewer than 2 reference images (to avoid the timeout).

For queue-internal calls, always use the flash model regardless of quality setting — the 50s timeout budget is too tight for the pro model with multiple images.

### Changes

#### `supabase/functions/generate-freestyle/index.ts`

**Line 578-581 — Change model selection logic:**

```
Before:
  const aiModel = (body.quality === "high" || refCount >= 2)
    ? "google/gemini-3-pro-image-preview"
    : "google/gemini-2.5-flash-image";

After:
  // Queue-internal: always use fast model (must finish within 50s timeout)
  // Direct calls: allow pro model only for high quality with 0-1 refs
  const aiModel = isQueueInternal
    ? "google/gemini-2.5-flash-image"
    : (body.quality === "high" && refCount < 2)
      ? "google/gemini-3-pro-image-preview"
      : "google/gemini-2.5-flash-image";
```

This is the only change needed. The timeouts, storage uploads, and queue optimizations from the previous refactor are already in place and working correctly.

### Why This Fixes It

| Scenario | Before | After |
|----------|--------|-------|
| Queue + 3 images | Pro model, >50s, TIMEOUT | Flash model, ~15-25s |
| Queue + 1 image | Pro model, ~30-40s, borderline | Flash model, ~10-15s |
| Direct + high quality + 0-1 refs | Pro model (OK, no queue timeout) | Pro model (unchanged) |
| Direct + standard quality | Flash model | Flash model (unchanged) |

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Change model selection: always use flash model for queue-internal calls; only allow pro model for direct high-quality calls with 0-1 reference images |

