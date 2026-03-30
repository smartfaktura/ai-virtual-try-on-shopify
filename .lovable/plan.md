

# Fix: Product Listing Set showing only 1 image in results

## Problem
When generating multiple scenes in the Product Listing Set workflow, only 1 image appears in results despite multiple images being generated.

**Root cause:** Two result watchers race against each other:
1. **`activeJob` watcher** (line ~1716) — fires when ANY single job completes, immediately setting `generatedImages` to that one job's images and transitioning to the results step
2. **`batchState` watcher** (line ~1739) — fires when ALL batch jobs are done, aggregating all images

The `activeJob` watcher guards against `multiProductJobIds` but does NOT guard against an active batch (`batchState`). When `startBatch` creates multiple jobs, the `useGenerationQueue` hook's `restoreActiveJob` picks up one of them as `activeJob`. When that one job completes, the `activeJob` watcher fires first and shows only 1 image — before the batch watcher can aggregate all results.

## Fix

**File: `src/pages/Generate.tsx`** — line ~1717

Add a guard to the `activeJob` completion watcher to skip when a batch is in progress:

```tsx
// Before (line 1717-1719):
if (!activeJob) return;
if (multiProductJobIds.size > 0) return;
if (currentStep === 'results') return;

// After:
if (!activeJob) return;
if (multiProductJobIds.size > 0) return;
if (batchState) return;  // ← NEW: let the batch watcher handle aggregation
if (currentStep === 'results') return;
```

This single line ensures that when a batch is active (multiple jobs for multiple scenes), the batch watcher handles result aggregation with all images instead of the single-job watcher short-circuiting with just 1 image.

Add `batchState` to the dependency array of that `useEffect` as well.

