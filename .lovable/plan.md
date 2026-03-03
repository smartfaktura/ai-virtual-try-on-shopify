

## Fix Emoji Usage, Concurrent Workflow Prevention & Restore-Job Refresh Issue

### Problem Analysis

1. **Emoji in product badges**: Line 3062 uses `⏳` and `✓` emoji characters in product progress badges during multi-product generation
2. **Concurrent workflows**: The `enqueue_generation` DB function only blocks on `processing` status (concurrent limit), but allows queuing multiple workflows. Users can start a second workflow before the first finishes — this should be prevented at the UI level
3. **Page refresh/flicker**: `useGenerationQueue` has a `restoreActiveJob` effect that runs on mount, finds any queued/processing job (even from a different page context like Workflows), sets it as `activeJob`, and starts polling — this can cause the Generate page to flip into "generating" state unexpectedly

### Changes

#### 1. Remove emojis from product badges (`src/pages/Generate.tsx`, line 3062)

Replace `✓` with text "Done", `⏳` with text "...", and `○` with a dash:

```tsx
{idx < currentProductIndex ? 'Done' : idx === currentProductIndex ? '...' : '—'} {p.title}
```

#### 2. Block new workflow generation when jobs are active (`src/pages/Generate.tsx`)

Before allowing `handleWorkflowGenerate` to proceed (around line 603), check if there are already queued/processing jobs in the queue. Query `generation_queue` for the user's active jobs and block with a toast if any exist.

Add a check at the top of `handleWorkflowGenerate`:
```tsx
// Check for existing active jobs before starting new workflow
const { data: existingJobs } = await supabase
  .from('generation_queue')
  .select('id', { count: 'exact', head: true })
  .in('status', ['queued', 'processing']);

if (existingJobs !== null && (existingJobs as any) > 0) {
  toast.error('Please wait for your current generation to finish before starting another.');
  return;
}
```

Actually, since `generation_queue` isn't in the typed client, we need to use raw fetch. But simpler: use `isQueueProcessing` from the existing `useGenerationQueue` hook — if `activeJob` is queued/processing, block the generate button.

The hook already exposes `isProcessing` (aliased as `isQueueProcessing`). Add this check at the start of `handleWorkflowGenerate` and also disable the Generate button when `isQueueProcessing` is true.

#### 3. Fix restore-job causing unwanted state changes (`src/hooks/useGenerationQueue.ts`)

The `restoreActiveJob` effect (line 204-245) unconditionally restores any queued/processing job on mount. When navigating from Workflows back to Generate, this picks up workflow jobs from a previous session and puts the page into "generating" mode.

Fix: Only restore if there isn't already an active job and the hook hasn't been reset. Add a guard:
```tsx
if (jobIdRef.current) return; // Already tracking a job
```

This prevents the restore from interfering when the user navigates between pages.

### Files changed — 2
- `src/pages/Generate.tsx` — Remove emojis from badges; block generation when a job is already active
- `src/hooks/useGenerationQueue.ts` — Guard `restoreActiveJob` to prevent unwanted state restoration

