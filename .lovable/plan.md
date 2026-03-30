

## Remaining Edge Case: Stale/Missing `onCreditRefresh` in Batch Hook

### Finding

**File: `src/pages/Generate.tsx` (line 201)**
`useGenerationBatch()` is called without passing `{ onCreditRefresh }`. The credit refresh callback we just added to the batch hook is never wired up, so batch completions still won't refresh the credit balance.

**File: `src/hooks/useGenerationBatch.ts` (line 183)**
`pollAllJobs` is a `useCallback` with deps `[stopPolling]`, but it references `onCreditRefresh` inside the closure. If the callback ever changes identity, `pollAllJobs` would hold a stale reference. This should use a ref pattern (like we did for `pollJobStatusRef`).

### Everything Else — Confirmed Good

- `hasRestoredRef` guard — works correctly, runs once
- Token refresh on 401 in batch polling — works correctly
- `handleTerminalJob` credit refresh — fires for all terminal states
- Self-heal removal — clean, 10-min hard timeout covers all job types
- `enqueueWithRetry` integration — correct error mapping, proper toast messages
- Cancel flow — checks status, uses RPC, refreshes credits
- Position query — cosmetic only, not a functional bug

### Plan

| File | Change |
|------|--------|
| `src/hooks/useGenerationBatch.ts` | Use a `onCreditRefreshRef` to avoid stale closure; add it to the `allDone` path |
| `src/pages/Generate.tsx` | Pass `{ onCreditRefresh }` from credit context to `useGenerationBatch()` |

**File: `src/hooks/useGenerationBatch.ts`**
1. Add `const onCreditRefreshRef = useRef(onCreditRefresh)` + keep it synced
2. In `pollAllJobs`, reference `onCreditRefreshRef.current?.()` instead of `onCreditRefresh?.()`

**File: `src/pages/Generate.tsx`**
1. Find where `onCreditRefresh` / `refreshCredits` is available (from CreditContext or similar)
2. Pass it: `useGenerationBatch({ onCreditRefresh: refreshCredits })`

