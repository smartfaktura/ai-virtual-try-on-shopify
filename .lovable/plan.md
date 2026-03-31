

## Fix: 502/503 Errors Bypass Seedream Fallback — Both Tryon and Workflow

### Root Cause Found

The DB shows the **exact failures from ~52 min ago**:
- 5 jobs failed with **"Unexpected end of JSON input"** 
- 2 jobs failed with **"AI Gateway error: 502"**
- 2 jobs failed with **"AI Gateway error: 503"**
- 1 job **"Timed out after 5 minutes"** (old cleanup timer)
- ALL have `retry_count: 0` — auto-retry never triggered

The JSON safety fix (try/catch around `response.json()`) is deployed and correctly returns `null` to trigger Seedream fallback. **But there's a critical remaining bug:**

### The Bug: 502/503 Throws Instead of Returning Null

```text
Line 467 (tryon) / Line 695 (workflow):
  throw new Error(`AI Gateway error: ${response.status}`);
```

For 502/503 responses, after retries are exhausted, the function **throws an error**. This throw propagates to the outer catch (line 782/tryon), which pushes to the `errors` array. The Seedream fallback (line 725) **only checks `if (base64Url === null)`** — a thrown error skips right past it.

```text
Timeline of a 502 failure:
  generateImageWithModel() → HTTP 502 → throw new Error("AI Gateway error: 502")
  ↓ (thrown — never returns null)
  catch block at line 771 → errors.push("Image 1: AI Gateway error: 502")
  ↓ (Seedream fallback on line 725 is NEVER reached)
  → User sees error
```

### The Fix

**Change line 467 (tryon) and line 695 (workflow)**: For 502/503 gateway errors, `return null` instead of `throw`, so the Seedream fallback chain triggers.

Keep `throw` only for 429 (rate limit) and 402 (payment) — those are intentional user-facing errors that should NOT fallback.

### Also Fix: `claim_next_job` Still Sets 5-Minute Timeout

The DB function `claim_next_job` sets `timeout_at = now() + interval '5 minutes'`. The edge function overrides to 3 min on heartbeat, but if it crashes before the first heartbeat, cleanup waits the full 5 min. Change to 3 min in the DB function.

### Changes

#### File 1: `supabase/functions/generate-tryon/index.ts`
- Line 467: Change `throw new Error(...)` to `return null` for non-429/402 errors (502, 503, 500, etc.)

#### File 2: `supabase/functions/generate-workflow/index.ts`  
- Line 695: Same change — `return null` instead of `throw` for gateway errors

#### Migration: Update `claim_next_job`
- Change `timeout_at = now() + interval '5 minutes'` to `now() + interval '3 minutes'`

### After Fix

```text
502/503 failure flow:
  generateImageWithModel() → HTTP 502 → return null
  ↓
  base64Url === null → Seedream 4.5 fallback (90s)
  ↓ (if Seedream fails)
  base64Url === null → Flash fallback
  ↓
  User gets image (or partial success with refund)
```

### Files Changed
1. `supabase/functions/generate-tryon/index.ts` — return null on 502/503
2. `supabase/functions/generate-workflow/index.ts` — return null on 502/503
3. DB migration — `claim_next_job` timeout 5min → 3min

