

# Fix Freestyle Variation Count Not Propagating

## Problem
The enqueue logs prove the frontend sends `imageCount: 1` every time, even when the UI shows 4 selected. All recent jobs show `cost=6` (1 × 6 credits) instead of `cost=24` (4 × 6 credits). The backend edge function is already fixed — this is purely a frontend issue.

## Root Cause
The `variationCount` state value is likely not being captured correctly by the `handleGenerate` callback despite being in the dependency array. This can happen with complex React callbacks when intermediate re-renders cause the closure to capture a stale value.

## Fix

### 1. Use a ref to guarantee current value
In `src/pages/Freestyle.tsx`, add a `useRef` for `variationCount` that always holds the latest value, and read from the ref inside `handleGenerate` instead of relying on the closure:

```typescript
const variationCountRef = useRef(variationCount);
useEffect(() => { variationCountRef.current = variationCount; }, [variationCount]);
```

Then in `handleGenerate`, replace all `variationCount` references with `variationCountRef.current`. This eliminates any possibility of a stale closure.

### 2. Add a debug log (temporary)
Add `console.log('[freestyle] Generate with variationCount:', variationCountRef.current)` at the start of `handleGenerate` so we can verify the value in the browser console.

### 3. Redeploy edge function
Redeploy `generate-freestyle` to ensure the backend fix (respecting `imageCount` for queue jobs) is live.

## Technical Details
- File: `src/pages/Freestyle.tsx` — use ref pattern for `variationCount`
- File: `supabase/functions/generate-freestyle/index.ts` — redeploy only, no code changes needed
- The ref pattern is already used in this file for `prompt`, `refreshImages`, `refreshBalance`, and `resetQueue` — this follows the existing convention

