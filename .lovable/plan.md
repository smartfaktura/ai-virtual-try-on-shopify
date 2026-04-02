

# Fix Catalog 20-Job Bottleneck + Crash-to-Wizard Issue

## Problem 1: Jobs stall after 20

**Root cause**: `process-queue/index.ts` line 65 has `MAX_CONCURRENT_JOBS = 20`. Once 20 jobs reach "processing" status, the dispatcher stops. The catalog hook sends a single `wakeOnly` call after enqueuing all 36 jobs, but `process-queue` runs once, dispatches 20, hits the cap, and exits. There is **no periodic re-wake** in the catalog polling loop — unlike `useGenerationQueue.ts` which re-triggers `retry-queue` every 60s for stuck jobs.

The remaining 16 jobs sit in "queued" status until the first 20 complete and free slots, but nobody re-invokes `process-queue` to dispatch them.

**Fix**: Add a periodic wake in the catalog polling loop. During each poll cycle, if there are still "queued" jobs, fire a `retry-queue` call (throttled to once per 30s) to re-trigger `process-queue` and dispatch the backlog as slots open up.

### File: `src/hooks/useCatalogGenerate.ts`
- Add a `lastWakeRef` to track when we last sent a wake
- In `pollJobs`'s `poll()` function, after updating job statuses, check if any jobs are still "queued" and it's been >30s since last wake — if so, fire `retry-queue`

## Problem 2: Crash to wizard screen after failure

**Root cause**: The batch state (`batchState`) is purely in-memory via `useState`. When all jobs fail or the polling encounters an unhandled error (e.g., a network failure in the poll fetch that throws), the component can re-mount and lose state, showing the wizard again.

Two specific triggers:
1. **Unhandled promise rejection in poll**: If `res.json()` throws (malformed response), the `poll` function crashes silently. The `setInterval` keeps running but `setBatchState` is never called with `allDone: true`, so the UI stays in "generating" state until the 10-minute timeout — but if a React re-render or auth refresh causes remount, state is lost.
2. **Auth session refresh**: If `supabase.auth.getSession()` triggers a token refresh that causes a brief re-render cycle, the component remounts and `batchState` resets to `null`, which renders the wizard.

**Fix**: 
1. Wrap the entire `poll` function body in try/catch so polling never crashes
2. Persist batch job IDs to `sessionStorage` so if the component remounts, it can resume polling from the saved job IDs instead of showing the wizard

### File: `src/hooks/useCatalogGenerate.ts`
- Wrap `poll()` body in try/catch — on error, log and continue (don't crash the interval)
- After setting initial `batchState`, save `{ jobIds, totalJobs, jobMeta }` to `sessionStorage('catalog_batch')`
- On hook mount, check `sessionStorage('catalog_batch')` — if found and jobs exist, rebuild `jobsRef` and resume polling
- Clear `sessionStorage('catalog_batch')` on `resetBatch()` and when `allDone`

### File: `src/pages/CatalogGenerate.tsx`
- No changes needed — the hook handles recovery internally

## Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/useCatalogGenerate.ts` | Add periodic re-wake for queued jobs (30s throttle); wrap poll in try/catch; persist/restore batch via sessionStorage |

