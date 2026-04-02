

# Fix: generate-tryon 429 Must Trigger Fallback Chain

## Problem
Identical to the workflow bug we just fixed. In `generate-tryon`, when Gemini Pro hits a 429 rate limit:

1. Line 516: `throw { status: 429, message: "..." }` 
2. Line 544: catch re-throws errors with `status` property
3. Line 871: outer catch returns error response immediately
4. Lines 824-844 (Seedream + Flash fallbacks) are never reached

The logs confirm this: "AI Gateway 429 (attempt 1/1) — backing off" → immediate refund, no fallback attempted.

## Solution
One-line change: line 516 — return `null` instead of throwing on 429 exhaustion, exactly like we did for generate-workflow.

### `supabase/functions/generate-tryon/index.ts`

**Line 516** — Change:
```typescript
// Before:
throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };

// After:
console.error(`[generate-tryon] All 429 retries exhausted, returning null for fallback`);
return null;
```

## Result
- 429 on Gemini Pro → returns null → Seedream 4.5 fallback → Gemini Flash fallback
- 402 (payment required) still throws immediately (correct behavior)
- All three fallback tiers now properly activate for try-on jobs

