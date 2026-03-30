

## Final Edge Cases Found

### Issue 1: Double credit refresh on hard timeout

**File:** `src/hooks/useGenerationQueue.ts` lines 310-311

```typescript
handleTerminalJob(syntheticJob);  // ← calls onCreditRefresh?.() internally (line 141)
onCreditRefresh?.();              // ← calls it AGAIN
```

`handleTerminalJob` already calls `onCreditRefresh?.()` at line 141 for all terminal states. The explicit call at line 311 is redundant and triggers two simultaneous balance fetches. Same pattern does NOT exist for normal completions (line 341 only calls `handleTerminalJob`), so this is specific to the hard-timeout path.

**Fix:** Remove line 311 (`onCreditRefresh?.()`) — `handleTerminalJob` already handles it.

---

### Issue 2: Stale `onCreditRefresh` closure in `pollJobStatus`

**File:** `src/hooks/useGenerationQueue.ts` line 357

`pollJobStatus` is a `useCallback` with `onCreditRefresh` in its deps (line 357). When `pollJobStatus` is called, it creates a recursive `setTimeout` chain via `runPoll`. The `onCreditRefresh` reference captured at that moment stays frozen for the entire polling session — even if the callback identity changes later.

This is mostly mitigated because `handleTerminalJob` (which also captures `onCreditRefresh`) is called at the end, so they're at least consistent. But it's fragile.

**Fix:** Use an `onCreditRefreshRef` pattern (like the batch hook) and remove `onCreditRefresh` from `pollJobStatus` deps. This also stabilizes `pollJobStatus` identity, which stabilizes `enqueue` (line 487 depends on `pollJobStatus`).

---

### Plan

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | 1. Add `onCreditRefreshRef` + sync effect. 2. Replace all direct `onCreditRefresh?.()` calls with `onCreditRefreshRef.current?.()` in `handleTerminalJob`, `pollJobStatus`, and `cancel`. 3. Remove `onCreditRefresh` from all `useCallback` dep arrays. 4. Remove redundant double-call at line 311. |

This is a small, surgical change — swap 4-5 references from direct to ref, remove one redundant line, and clean up dep arrays.

