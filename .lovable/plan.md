

# Fix Stuck Progress Counter in Product Images Generation

## Problem
The progress UI shows "19 of 36 images completed" even though all 37 jobs are done in the database. Two root causes:

1. **Silent error swallowing**: The `catch` block at line 872 in `startPolling` catches all errors silently and retries, but never updates the UI — so if a network blip or auth token expiry causes repeated failures, the counter freezes at the last successful poll value.

2. **`expectedJobCount` mismatch**: The total is pre-computed via `computeTotalImages()` before enqueuing starts, but the actual number of enqueued jobs can differ (37 enqueued vs 36 expected). The display uses `expectedJobCount` as the denominator, so counts can be off.

## Solution

### 1. Use actual enqueued count as the denominator (not pre-computed estimate)
**File: `src/components/app/product-images/ProductImagesStep5Generating.tsx`**
- Change `effectiveTotal` to prefer `totalJobs` (actual `jobMap.size`) over `expectedJobCount` once jobs are enqueued
- Logic: `const effectiveTotal = totalJobs > 0 ? totalJobs : expectedJobCount;`
- This ensures the "X of Y" always reflects reality once enqueuing completes

### 2. Add token refresh retry to polling (matching `useGenerationBatch` pattern)
**File: `src/pages/ProductImages.tsx`** (lines 816-874)
- On Supabase query failure, refresh the auth session and retry once (same pattern used in `useGenerationBatch.ts` lines 98-113)
- Log errors in the catch block instead of silently swallowing them
- Add a `console.warn` so polling failures are visible in console

### 3. Accelerate polling when near completion
**File: `src/pages/ProductImages.tsx`** (line 871)
- When >80% done, reduce poll interval from 3s → 1.5s to catch final completions faster
- `pollingRef.current = setTimeout(poll, pct > 80 ? 1500 : 3000);`

### 4. Sync `expectedJobCount` after enqueuing finishes
**File: `src/pages/ProductImages.tsx`** (after enqueuing loop)
- After all jobs are enqueued, update: `setExpectedJobCount(newJobMap.size);`
- This corrects any mismatch between the pre-computed estimate and actual enqueued count

## Impact
- Progress counter will always show accurate "X of Y" based on real enqueued jobs
- Polling survives auth token expiry via automatic refresh
- Faster final updates when generation is nearly done
- No more frozen counters from silent network errors

