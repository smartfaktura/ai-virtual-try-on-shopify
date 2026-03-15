

## Fix: Update Credit Balance After Perspective Generations

### Problem
The `enqueue-generation` edge function correctly deducts credits in the database and returns `newBalance` in the response. However, `useGeneratePerspectives` never reads `newBalance` from the response, and the Perspectives page never calls `setBalanceFromServer()` to update the UI. So the credit indicator stays stale until the next page refresh or subscription check.

### Solution
Two small changes:

**`src/hooks/useGeneratePerspectives.ts`** — Return the last `newBalance` from the enqueue responses in the `GenerateResult`:
- Add `newBalance: number | null` to the `GenerateResult` interface
- After each successful enqueue response, capture `result.newBalance`
- Return the last captured `newBalance` in the result object

**`src/pages/Perspectives.tsx`** — After calling `generate()`, update the credit context:
- Import `useCredits` and destructure `setBalanceFromServer`
- After `generate()` returns, call `setBalanceFromServer(result.newBalance)` if non-null

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Capture and return `newBalance` from enqueue responses |
| `src/pages/Perspectives.tsx` | Call `setBalanceFromServer` after generation completes |

