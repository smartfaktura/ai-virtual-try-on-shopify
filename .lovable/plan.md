

# Add Fallback for Model Workflows

## Problem
The workflow generation has a 3-tier fallback chain (Gemini Pro → Seedream 4.5 → Gemini Flash), but it's **only active for product-only workflows**. When a model is attached (`body.model?.imageUrl` exists), Gemini Pro failure means immediate failure with no fallback — which is what happened in the recent failed generations (429 rate limits, credits refunded).

## Solution
Enable the Gemini Flash fallback for model workflows too. Seedream can't preserve model identity so it should remain skipped, but Gemini Flash can handle model reference images just like Gemini Pro.

## Changes

### `supabase/functions/generate-workflow/index.ts`

**Line ~1165-1196** — Modify the fallback logic:

1. **Keep Seedream fallback gated** to product-only (no change) — Seedream doesn't support model identity preservation.

2. **Enable Flash fallback for ALL workflows** — Remove the `!body.model?.imageUrl` condition from the Flash fallback block (line 1184). Flash can handle model reference images the same way Pro does.

```
Before:
  // Flash fallback: last resort for product-only if Seedream also failed
  if (imageUrl === null && !body.model?.imageUrl) {

After:
  // Flash fallback: last resort if primary + Seedream both failed
  if (imageUrl === null) {
```

This means the chain becomes:
- **With model**: Gemini Pro (2 attempts) → Gemini Flash (2 attempts)
- **Without model**: Gemini Pro (2 attempts) → Seedream 4.5 → Gemini Flash (2 attempts)

## Risk
Low — Flash is already proven as a fallback in freestyle. This just extends its use to model workflows where it was previously blocked.

