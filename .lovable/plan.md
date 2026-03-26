

# Diagnose & Fix Seedream Integration Issues

## Findings

### Issue 1: Seedream was NOT used for the last generation
The edge function logs confirm `model: "google/gemini-3.1-flash-image-preview"` was used, and the `[generate-freestyle] Using Seedream 4.5 (provider override)` log line is absent. The code flow looks correct (Freestyle.tsx sets `providerOverride` on the payload, it flows through the queue), but we can't diagnose further because:
- The log object (line 949-971) does **not** include `providerOverride` or `useSeedream` — so we're blind to what the edge function received
- If `BYTEPLUS_ARK_API_KEY` env var returned empty/undefined at runtime, `useSeedream` would be `false` even with the override set

### Issue 2: 1K resolution instead of 2K
The Seedream API call uses `size: "2K"` (line 324), which is correct. However, the Seedream API's `"2K"` size parameter may map to a specific resolution like 2048×2048 only for certain aspect ratios. For `1:1`, it might default to 1024×1024. This needs verification against the API docs, but the more immediate fix is to use an explicit resolution like `"2048x2048"` instead of `"2K"`.

## Plan

### 1. Add diagnostic logging to the edge function
In `supabase/functions/generate-freestyle/index.ts`, add `providerOverride`, `useSeedream`, and `hasArkKey: !!ARK_API_KEY` to the main log object (line 949). This will make future debugging trivial.

### 2. Fix Seedream resolution — use explicit pixel dimensions
Change `size: "2K"` to map the `aspectRatio` to explicit Seedream-supported dimensions:
- `1:1` → `"2048x2048"`
- `3:4` → `"1536x2048"`
- `4:3` → `"2048x1536"`
- `9:16` → `"1152x2048"`
- `16:9` → `"2048x1152"`

Pass the `aspectRatio` into `generateImageSeedream()` so it can compute the correct dimensions.

### 3. Verify the ARK API key is accessible
Add a startup log line: `console.log("[generate-freestyle] ARK key present:", !!Deno.env.get("BYTEPLUS_ARK_API_KEY"))` so we can confirm the secret is actually available at runtime.

## Files to Modify
- **`supabase/functions/generate-freestyle/index.ts`** — Add diagnostic logging, fix resolution mapping, pass aspect ratio to Seedream function

