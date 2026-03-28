

# Reduce Pro Retries to 0, Go Straight to Seedream

## Change
In `supabase/functions/generate-tryon/index.ts`, change `maxRetries` from `2` to `0` inside `generateImageWithModel` (line 405). This means Pro gets exactly 1 attempt — if it fails, execution immediately moves to Seedream.

## File: `supabase/functions/generate-tryon/index.ts`

**Line 405**: Change `const maxRetries = 2;` → `const maxRetries = 0;`

That's it. Single line change. Pro gets 1 shot (~40-60s), then Seedream (~90s), then Flash if needed — total worst case ~3.5 min, well within the 5-min timeout.

