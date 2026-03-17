

## Fix: Freestyle generation hijacking workflow setup

### Root Cause

When you navigate from Freestyle (with a generation running) to a Workflow page (`/app/generate/...`), the Generate page mounts a new `useGenerationQueue` hook. On mount, this hook runs `restoreActiveJob` (line 349 of `useGenerationQueue.ts`) which picks up **any** active job for the user — including the freestyle job still in progress. When that freestyle job completes, the `useEffect` in `Generate.tsx` (line 1221) fires unconditionally, calling `setCurrentStep('results')` and showing the "Generated 1 images!" toast, hijacking the workflow UI.

### Fix (2 changes)

1. **`useGenerationQueue.ts` — Add optional `jobType` filter to `restoreActiveJob`**
   - Add an optional `jobType` parameter to `UseGenerationQueueOptions`
   - In the `restoreActiveJob` query (line 358), add a `job_type` filter when specified: `&job_type=eq.${jobType}`
   - This prevents the workflow page from restoring a freestyle job and vice versa

2. **`Generate.tsx` — Pass `jobType` filter when initializing the queue hook**
   - Determine the expected job type based on the current workflow context (e.g., `'workflow'` or `'tryon'`)
   - Pass it to `useGenerationQueue({ jobType: 'workflow' })` so only workflow jobs are restored
   - Also add a guard in the completion `useEffect` (line 1225): skip if `activeJob.job_type` doesn't match the expected type for this page

3. **`Freestyle.tsx` — Pass `jobType: 'freestyle'`** to its own `useGenerationQueue` call so it only restores freestyle jobs

This ensures each page only picks up and reacts to its own generation jobs, preventing cross-contamination between Freestyle and Workflow flows.

