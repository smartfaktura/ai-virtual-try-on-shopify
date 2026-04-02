

# Fix: 429 Errors Must Trigger Fallback Instead of Throwing

## Problem
The Flash fallback code we added (line 1184) is correct, but it **never executes** for 429 errors. Here's why:

1. `generateImage()` retries 429 twice (lines 726-733)
2. After retries exhausted, it **throws** `{ status: 429, message: "..." }` (line 733)
3. The catch block at line 778 re-throws any error with a `status` property (line 784)
4. The outer catch at line 1266 catches it and **immediately returns a failure response** (line 1276)
5. The fallback code at lines 1165-1196 is never reached

## Solution
Change `generateImage()` to **return null** on 429 exhaustion instead of throwing, matching how other errors (timeouts, gateway errors) already work. This lets the fallback chain execute.

### `supabase/functions/generate-workflow/index.ts`

**Line 733** — Change throw to return null:
```
// Before:
throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };

// After:
console.error(`[generate-workflow] All 429 retries exhausted, returning null for fallback`);
return null;
```

This is a one-line change. The fallback chain (Seedream for product-only, then Flash for all) will now properly activate when Gemini Pro hits rate limits.

## Result
- 429 on Gemini Pro → returns null → Seedream fallback (if no model) → Flash fallback
- The existing behavior for 402 (payment required) remains unchanged — that still throws immediately, which is correct since fallback won't help with billing issues.

