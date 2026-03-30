

## Fix: Batch Grouping Window Too Narrow

### Problem

The grouping compares each row's timestamp to the **anchor** (first row in the group). Rows are sorted newest-first, so as we walk older rows the gap grows. A 16-product batch spans ~2-3 minutes of enqueue time, exceeding the 60-second window. Result: each job becomes its own group showing "1 imgs".

### Fix

**File: `src/pages/Workflows.tsx`** — Two changes:

1. **Track a `lastMergedTime` per group** instead of using the anchor's `created_at`. Each time a row merges into a group, update `lastMergedTime` to that row's timestamp. This creates a **sliding window** — each consecutive job only needs to be within 60s of the *previous* job, not the first one.

2. **Increase window to 120s** as safety margin for large batches where enqueue gaps between individual jobs may exceed 60s.

```text
Before (anchor-based):  Job 1 (0s) ← Job 2 (30s) ✓ ← Job 3 (70s) ✗ NEW GROUP
After (sliding window):  Job 1 (0s) ← Job 2 (30s) ✓ ← Job 3 (70s, 40s from Job 2) ✓
```

Concrete change in the grouping loop (~line 224-253):
- Add `lastMergedTime` field to `GroupedJob` interface
- On merge: update `lastGroup.lastMergedTime = rowTime`
- Compare against `lastGroup.lastMergedTime` instead of `lastGroup.created_at`
- Window: 120_000ms

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Switch from anchor-based to sliding-window grouping; increase window to 120s |

