

# Fix: Credit Balance Not Updating Immediately After Batch Enqueue

## What's happening

The credit deduction logic is **correct** — the database atomically deducts credits and the math is right (6 credits × jobs). The problem is purely a **UI refresh issue**.

When product-images uses the batch enqueue path (`startBatch`), the `firstNewBalance` returned by the server is calculated but **never sent back to update the sidebar credit indicator**. The balance only refreshes when all jobs finish (via `onCreditRefresh`), so the sidebar shows the old balance during the entire generation, then jumps to 0.

Single-job paths (like Freestyle) correctly call `setBalanceFromServer(result.newBalance)` immediately, so the sidebar updates instantly. The batch path is missing this.

## Fix

### `src/hooks/useGenerationBatch.ts`

1. **Return `firstNewBalance` from `startBatch`** — change the return type from `Promise<boolean>` to `Promise<{ success: boolean; newBalance: number | null }>` so callers can update the UI immediately
2. After all jobs are enqueued, return `firstNewBalance` (the balance after the first deduction gives an accurate "floor" for the remaining balance — since all subsequent deductions happen atomically, the last job's `newBalance` is even more accurate, so switch to tracking `lastNewBalance` instead)

### `src/pages/Generate.tsx`

3. After `startBatch` returns, call `setBalanceFromServer(result.newBalance)` immediately — same pattern already used for single-job enqueue paths on lines 1141, 1296, 1429, etc.

## Files

| File | Change |
|------|--------|
| `src/hooks/useGenerationBatch.ts` | Track `lastNewBalance`, return it from `startBatch` |
| `src/pages/Generate.tsx` | After `startBatch`, call `setBalanceFromServer` with the returned balance |

