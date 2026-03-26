

# Fix: Video Generations Stuck — Edge Function Timeout

## Root Cause
The `generate-video` edge function submits a Kling task then **polls for up to 4 minutes** (48 × 5s) inside a fire-and-forget background task. When the edge function isolate is killed (~150s timeout), the polling loop dies silently. The queue job stays "processing" forever, and the client shows "Queued" until the 10-minute hard timeout force-fails it.

The logs confirm: Kling task `866161510941335611` was submitted successfully, but the isolate is killed before polling can detect completion.

## Solution: Submit-Only Worker + Client-Side Polling

Split the architecture so the edge function only **submits** to Kling (fast, <5s), and the **client** polls Kling status via a lightweight status-check endpoint.

### Changes

**1. `supabase/functions/generate-video/index.ts` — Make worker submit-only**
- Remove the 48-iteration polling loop from `handleWorkerMode`
- After creating the Kling task and saving `kling_task_id` to both `generation_queue.result` and `generated_videos`, return immediately
- The queue job stays "processing" — client takes over polling

**2. `src/hooks/useGenerateVideo.ts` — Add client-side Kling polling**
- When `queue.activeJob` reaches `processing` status, extract `kling_task_id` from `activeJob.result`
- Start a client-side polling loop that calls the existing `generate-video` edge function with `action: "status"` every 10s
- On Kling `succeed`: update local state, mark complete — the status endpoint already saves the video to storage and updates `generated_videos`
- On Kling `failed`: update local state with error
- On Kling still processing: continue polling (up to 10 min, matching existing hard timeout)
- Clean up polling on unmount/reset

**3. `supabase/functions/generate-video/index.ts` — Update status endpoint to also complete queue job**
- When the `action: "status"` endpoint detects `succeed`, also update the `generation_queue` row to `completed` with the video URL in `result`
- When it detects `failed`, also update the queue row to `failed` and refund credits
- This ensures the queue polling in `useGenerationQueue` also sees the terminal state

### Files Modified
- `supabase/functions/generate-video/index.ts`
- `src/hooks/useGenerateVideo.ts`

### Why This Works
- Edge function finishes in <5s (submit only) — no timeout risk
- Client polls every 10s for up to 10 min — plenty of time for Kling (typically 2-3 min)
- The existing `action: "status"` endpoint already handles video download + storage — we just need it to also update the queue job
- No new edge functions needed

