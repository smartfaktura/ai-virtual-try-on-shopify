

# Fix Duplicate Videos and Auto-Refresh in Video Hub

## Problems Identified

1. **Duplicate videos**: The `generated_videos` table likely contains duplicate rows per generation (e.g., from retries or the recover function re-inserting). The `fetchHistory` query has no deduplication by `kling_task_id`.

2. **No auto-refresh after completion**: When a video finishes processing while the user is on the Video Hub, the history only refreshes every 15 seconds IF there are already processing/queued videos visible. There is no realtime listener or window-focus refetch to catch completions smoothly.

## Plan

### 1. Deduplicate history query (`src/hooks/useGenerateVideo.ts`)
- Add `.not('kling_task_id', 'is', null)` filter to exclude incomplete rows
- Deduplicate results client-side by `kling_task_id` to prevent showing the same video twice (keep the latest row)

### 2. Add window focus refetch (`src/hooks/useGenerateVideo.ts`)
- Add a `visibilitychange` / `focus` event listener that calls `fetchHistory()` when the user returns to the tab or navigates back to Video Hub
- This ensures videos completed while away are immediately visible

### 3. Faster polling when jobs are active (`src/hooks/useGenerateVideo.ts`)
- Reduce the auto-refresh interval from 15s to 8s for processing videos
- Immediately refresh history when the queue `activeJob` transitions to `completed`

### 4. Smooth transition on completion (`src/pages/VideoHub.tsx`)
- After `onDeleted` or when `selectedVideo` updates, refresh history to reflect the latest state

## Technical Details

### File: `src/hooks/useGenerateVideo.ts`

**fetchHistory** - Add deduplication:
```typescript
// After fetching, deduplicate by kling_task_id
const seen = new Set<string>();
const deduped = signedHistory.filter(v => {
  if (!v.kling_task_id) return true;
  if (seen.has(v.kling_task_id)) return false;
  seen.add(v.kling_task_id);
  return true;
});
setHistory(deduped);
```

**Add focus-based refresh:**
```typescript
useEffect(() => {
  const onFocus = () => fetchHistory();
  window.addEventListener('focus', onFocus);
  return () => window.removeEventListener('focus', onFocus);
}, [fetchHistory]);
```

**Reduce polling interval** from 15000ms to 8000ms for snappier updates.

