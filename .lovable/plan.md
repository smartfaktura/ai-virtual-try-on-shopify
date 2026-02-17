

## Prevent Duplicate Kling Charges on Video Recovery

### How Kling Billing Works
- Kling charges credits only when a **new task is created** (POST to `/videos/image2video`)
- Status polling (GET) is completely free -- unlimited calls at no cost
- The proposed `recover` action only polls status, so it costs nothing on Kling's side

### The Real Risk
When client-side polling times out (after ~400 seconds), the UI shows an error state. The user may click "Generate" again with the same image, creating a **duplicate Kling task** and getting charged twice. The original task may still be processing successfully on Kling's side.

### Safeguards to Implement

**1. Block duplicate generation while a task is in-flight**

In `src/hooks/useGenerateVideo.ts`:
- Before calling `action: 'create'`, check the `history` array for any video with `status === 'processing'`
- If one exists, show a toast warning: "You already have a video processing. Please wait for it to finish." and abort
- This prevents duplicate Kling charges entirely

**2. On timeout, recover instead of giving up**

In `src/hooks/useGenerateVideo.ts`:
- When `MAX_POLLS` is exceeded, instead of setting status to "error", call `action: 'status'` one final time
- If Kling says "succeed", update DB and show the video
- If Kling says still "processing", set a gentler UI message: "Still processing on our end. We'll update your history when it's ready." (no error state that tempts a re-click)
- Only show "error" if Kling explicitly returns "failed"

**3. Add `recover` action to edge function**

In `supabase/functions/generate-video/index.ts`:
- Add a `recover` action that finds all `processing` videos for the user older than 10 minutes
- For each, poll Kling's status endpoint (free) and update the DB accordingly
- Call this on page load from the hook to auto-fix any stuck records

**4. Increase poll window**

In `src/hooks/useGenerateVideo.ts`:
- Change `MAX_POLLS` from 50 to 75 (8s x 75 = 10 minutes) to cover longer Kling processing times
- This reduces the chance of premature timeout

### Technical Details

**Files modified:**
- `src/hooks/useGenerateVideo.ts` -- duplicate guard, longer polling, graceful timeout, auto-recover on mount
- `supabase/functions/generate-video/index.ts` -- add `recover` action (status-only, zero Kling cost)

**Key logic for duplicate prevention:**
```text
startGeneration() {
  // Check for in-flight video
  const hasProcessing = history.some(v => v.status === 'processing');
  if (hasProcessing) {
    toast.warning("A video is already processing. Please wait.");
    return;
  }
  // ... proceed with create
}
```

**Key logic for recover action:**
```text
action: 'recover'
  -> SELECT * FROM generated_videos WHERE user_id = X AND status = 'processing'
     AND created_at < now() - interval '10 minutes'
  -> For each: GET Kling status (free)
  -> Update DB with actual status (complete/failed)
  -> Return count of recovered videos
```

No new Kling tasks are ever created during recovery. Status checks are free and unlimited.

