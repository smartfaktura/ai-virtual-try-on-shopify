

# Fix Video "Processing" Badge Stuck After Completion

## Problem
When a video finishes generating, the `/app/video` page can still show "Processing" on the card. This happens because:

1. The `generated_videos` table is only updated to `'complete'` when the **client-side** Kling status poll runs (via the `action: 'status'` edge function call)
2. If the user navigates away mid-generation, the poll stops. The video completes on Kling's side but `generated_videos` stays `'processing'`
3. The auto-recovery on mount only checks videos **older than 10 minutes** — so recently-completed videos slip through
4. There is no periodic re-check for videos still showing `'processing'` in the history

## Fix (two changes)

### 1. Remove the 10-minute threshold from recovery
**File: `supabase/functions/generate-video/index.ts`** (line 339)

Change recovery to check ALL `processing` videos for the user, not just those older than 10 minutes. Remove the `.lt("created_at", tenMinutesAgo)` filter. This way, when the page loads, any video stuck as `'processing'` gets its true status from Kling immediately.

### 2. Auto-refresh history when processing videos exist
**File: `src/hooks/useGenerateVideo.ts`**

Add a `useEffect` that sets up a 15-second polling interval whenever the `history` array contains any video with `status === 'processing'`. When no processing videos remain, polling stops. This ensures the UI updates promptly after recovery completes or after any status change.

```
// Pseudo-logic
useEffect(() => {
  const hasProcessing = history.some(v => v.status === 'processing');
  if (!hasProcessing) return;
  const interval = setInterval(fetchHistory, 15000);
  return () => clearInterval(interval);
}, [history, fetchHistory]);
```

These two changes together ensure: on page load, recovery immediately checks all stuck videos against Kling, and the UI polls until all cards reflect their true status.

