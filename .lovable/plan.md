

## Allow Queuing Multiple Workflows + Better Status Feedback

### Problem
The UI blocks new workflow generations with a red error toast when another is already running (line 605-608 in `Generate.tsx`). The backend already supports multiple concurrent/queued jobs (pro plan allows 4 concurrent), so this is purely a UI-side restriction that creates a bad experience.

### Changes

**1. `src/pages/Generate.tsx` — Remove the `isQueueProcessing` guard (lines 604-608)**

Remove the early-return block that shows "Please wait for your current generation to finish." The backend RPC (`enqueue_generation`) already enforces proper per-plan concurrency limits and returns appropriate errors (429 with `max_concurrent`) when truly exceeded. The `useGenerationQueue` hook already handles 429 responses with user-friendly toasts.

The hook will switch to tracking the new job. The previous job continues processing server-side and is visible via the `GlobalGenerationBar` on other pages and the activity feed on the Workflows page.

**2. `src/hooks/useGenerationQueue.ts` — Reset before new enqueue**

When `enqueue()` is called while an old job is still active, stop polling the old job before starting the new one. The old job's progress is already covered by the `GlobalGenerationBar`. Add `stopPolling()` at the start of the `enqueue` function before the fetch call.

### Result
- Users can queue multiple workflows back-to-back
- Backend enforces actual concurrency limits per plan
- If the limit is truly exceeded, the backend returns a proper error and the hook shows a descriptive toast
- The `GlobalGenerationBar` provides visibility into all running jobs across pages

### Files changed — 2
- `src/pages/Generate.tsx` — Remove the `isQueueProcessing` early-return guard
- `src/hooks/useGenerationQueue.ts` — Stop old polling when a new job is enqueued

