

## Fix: Bulletproof generate-tryon and generate-workflow — Seedream Fallback + JSON Safety

### Root Cause of "Unexpected end of JSON input"

Both `generate-tryon` (line 469) and `generate-workflow` (line 624) do bare `response.json()` after Gemini returns HTTP 200. When Gemini's response is truncated (the 502 "JSON error injected into SSE stream" we see in logs), the body is incomplete JSON — `response.json()` throws `SyntaxError: Unexpected end of JSON input`. Neither function catches this, so it bubbles up as a fatal error.

### Critical Issues Found

```text
generate-tryon:
  1. NO timeout on Gemini call (line 429) — no AbortSignal at all
  2. response.json() unprotected (line 469) — "Unexpected end of JSON input"
  3. No wall-clock safety deadline — platform can hard-kill
  4. No heartbeat/progress updates — cleanup can't save partial results
  5. Seedream fallback exists but primary has no timeout guard

generate-workflow:
  1. PER_IMAGE_TIMEOUT = 150_000 (150s!) — equals platform kill limit
  2. maxRetries = 3 with 150s timeout — could burn 450s theoretically
  3. response.json() unprotected (line 624) — same JSON crash
  4. NO Seedream fallback — if Gemini fails, no backup provider
  5. Wall-clock guard exists (140s) but per-image timeout too generous
```

### Changes

#### File 1: `supabase/functions/generate-tryon/index.ts`

**A. Add timeout + JSON safety to generateImageWithModel (line 429-476)**
- Add `AbortSignal.timeout(75_000)` to the fetch call (75s primary)
- Wrap `response.json()` in try/catch — if JSON parsing fails, log and return null (triggers fallback)

**B. Add Seedream fallback with timeout to generateImage (line 385)**
- Primary Gemini Pro gets 75s timeout
- If null → Seedream gets 90s (already implemented at line 706, just needs the primary timeout to actually trigger it)
- If Seedream fails → Flash gets remaining time

**C. Add wall-clock safety + heartbeat (main loop, line 696)**
- Add `FUNCTION_START = Date.now()` and `MAX_WALL_CLOCK_MS = 140_000`
- Before each image in loop: check wall clock, break if > 135s
- After each successful upload: write progress heartbeat to generation_queue (like workflow does)
- Override `timeout_at` to 3 minutes on first iteration

**D. Reduce timeout_at heartbeat to 3 min**
- When writing heartbeat, set `timeout_at = now + 3min` instead of default 5min

#### File 2: `supabase/functions/generate-workflow/index.ts`

**A. Fix per-image timeout (line 557)**
- Change `PER_IMAGE_TIMEOUT` from `150_000` to `75_000` (75s)
- Reduce `maxRetries` from 3 to 1 (2 attempts total — primary + 1 retry)

**B. Add Seedream fallback to generateImage (line 549)**
- After all Gemini retries return null, try Seedream 4.5 as backup
- Only for product-only generations (no model reference — Seedream can't do identity preservation)
- Seedream gets 90s timeout

**C. Wrap response.json() safely (line 624)**
- Try/catch around `response.json()` — if it throws "Unexpected end of JSON", log and retry/return null

**D. Reduce heartbeat timeout_at (line 1089)**
- Change `5 * 60 * 1000` to `3 * 60 * 1000` — match the freestyle fix

### Files Changed
1. `supabase/functions/generate-tryon/index.ts` — timeout, JSON safety, wall-clock, heartbeat
2. `supabase/functions/generate-workflow/index.ts` — timeout reduction, Seedream fallback, JSON safety, heartbeat fix

### Timeline After Fix

```text
generate-tryon:
  0s ── Gemini Pro (75s timeout) ── fail? ── Seedream (90s) ── fail? ── Flash
  Wall-clock safety at 135s, heartbeat every image, 3min timeout_at

generate-workflow:
  0s ── Gemini (75s timeout, 1 retry) ── fail? ── Seedream (product-only)
  Wall-clock safety at 140s (already exists), 3min timeout_at
  "Unexpected end of JSON" → caught → retry, not crash
```

