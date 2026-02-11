
## Fix: Generation State Lost on Page Refresh + App Crash

### Problem Summary
Two linked issues:
1. Refreshing the page during a generation wipes the loading state. The backend keeps working, but the UI shows nothing. Trying to generate again hits "max concurrent generations (1)".
2. When polling picks up the completed job, the `result` column contains ~1.7MB of base64 image data. Parsing this crashes the app.

### Solution

#### 1. Resume in-flight jobs on page load (`src/hooks/useGenerationQueue.ts`)

Add a recovery effect that runs when the user loads/refreshes the page:
- Query `generation_queue` for any `queued` or `processing` jobs belonging to the current user
- If found, resume polling for that job automatically
- The existing completion handler in `Freestyle.tsx` then picks up the result normally

```
On mount (when user is available):
  -> Check: any queued/processing jobs for this user?
  -> Yes: set jobIdRef, start polling
  -> No: do nothing
```

#### 2. Avoid fetching massive base64 results during polling (`src/hooks/useGenerationQueue.ts`)

The current polling fetches the full `result` column (~1.7MB of base64). Instead:
- During polling, only fetch `status`, `error_message`, `created_at`, `started_at`, `completed_at`, `priority_score` (exclude `result`)
- Only fetch `result` once, when the status transitions to `completed`
- This keeps polling lightweight and prevents the crash

#### 3. Handle the "concurrent" error more gracefully (`src/hooks/useGenerationQueue.ts`)

When the enqueue returns a 429 "concurrent" error:
- Attempt to find the active job and resume polling for it
- This way the user sees the progress of the existing job instead of just an error message

### Technical Details

**File: `src/hooks/useGenerationQueue.ts`**

Changes:
1. Add `useEffect` recovery hook (runs once when `user` becomes available):
   - Fetches `generation_queue?user_id=eq.{userId}&status=in.(queued,processing)&limit=1`
   - If a row is found, sets `jobIdRef.current` and calls `pollJobStatus()`

2. Modify `pollJobStatus` to exclude `result` from the polling select:
   - Change select to: `id,status,error_message,created_at,started_at,completed_at,priority_score`
   - When status becomes `completed`, make one additional fetch including `result`
   - Then update `activeJob` with the full data

3. In the `enqueue` function, when a 429 "concurrent" error is received:
   - After showing the toast, attempt recovery by querying for the active job
   - Resume polling so the user can see progress

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Add recovery effect, split result fetching from polling, handle concurrent error with recovery |

No other files need changes -- `Freestyle.tsx` already handles `activeJob.status === 'completed'` correctly.
