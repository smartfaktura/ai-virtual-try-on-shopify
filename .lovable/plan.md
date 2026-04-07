

# Remove 20-Job Cap & Auto-Refill Queue

## Problem
The `process-queue` dispatcher has a hard `MAX_CONCURRENT_JOBS = 20` cap. When a batch exceeds 20 images, the dispatcher exits after dispatching 20 jobs and nothing reliably wakes it again — causing the remaining jobs to sit `queued` indefinitely until a manual retry signal arrives.

Additionally, `ProductImages.tsx` never calls `retry-queue` during polling (unlike the Catalog flow), so there's no client-side safety net either.

## Why the cap isn't needed
The cap was meant to prevent overwhelming the AI gateway. But since each job is **fire-and-forget** (dispatched via fetch, not awaited), the dispatcher itself finishes in seconds regardless of how many jobs it dispatches. The AI gateway and edge function runtime handle their own concurrency. The 1-second stagger between dispatches already prevents thundering herd. A 42-job batch just means ~42 seconds of dispatching time, well within the 25-second runtime (which we'll extend slightly).

## Changes

### 1. `supabase/functions/process-queue/index.ts`
- **Remove `MAX_CONCURRENT_JOBS`** and the active-job count check (lines 62, 94-103)
- **Extend `MAX_RUNTIME_MS`** from 25s to 55s so a single invocation can dispatch up to ~55 jobs (one per second)
- **Move lock release to `finally`** block so it's always released even on errors
- Keep the 1-second stagger — that's a good rate limiter on its own

### 2. `src/pages/ProductImages.tsx`
- **Add a re-wake loop** during Step 5 polling: if any jobs still have `status = 'queued'`, call `retry-queue` every 30 seconds (throttled) as a safety net — matching what Catalog already does
- This ensures that even if the dispatcher finishes before all jobs are dispatched, the client nudges it again

### 3. `src/components/app/product-images/ProductImagesStep5Generating.tsx`
- **Fix the static "About 2 minutes" copy** — compute a dynamic estimate based on `effectiveTotal` (range: `ceil(total×10/60)` to `ceil(total×15/60)` minutes)

## Files
- `supabase/functions/process-queue/index.ts` — remove cap, extend runtime, harden lock release
- `src/pages/ProductImages.tsx` — add throttled re-wake during polling
- `src/components/app/product-images/ProductImagesStep5Generating.tsx` — dynamic time estimate

