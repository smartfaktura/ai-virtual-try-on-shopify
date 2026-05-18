## What I found

The latest talking video is currently stuck at the first stage:

- `generated_videos.status`: `processing`
- `metadata.stage`: `base_video`
- queue job: `847844c0-48a7-4669-9bfe-6c14ed17fff2`
- Kling base task: `885330189557833790`
- audio was generated successfully: `6.4s`
- lip-sync has not started yet because the base video has not completed

The backend itself is healthy. The job was dispatched correctly and did not error.

## Why it looks stuck

The UI shows it as “In Progress” because the job is still waiting for the Kling base video result. After that completes, the poller should submit the ElevenLabs audio to Kling lip-sync, then swap in the final video.

## Plan to improve this

1. **Add clearer stage visibility**
   - Show whether a talking video is in:
     - `Voice created`
     - `Generating base motion`
     - `Lip-syncing voice`
     - `Finalizing`
   - This avoids the current vague “Processing” state.

2. **Add a recovery path for base-video stage stalls**
   - If a talking video stays in `base_video` too long, mark it failed or retry cleanly instead of leaving it spinning.
   - Keep the existing refund behavior for true failures.

3. **Add manual/automatic retry for lip-sync-safe failures**
   - For a base video that exists but lip-sync fails, retry lip-sync before falling back to silent output.

4. **Improve backend logs for this exact flow**
   - Log base task status, lip-sync task status, and timeout decisions with the queue job id so future stuck jobs can be diagnosed immediately.

## Technical notes

- Main files involved:
  - `supabase/functions/poll-stuck-videos/index.ts`
  - `supabase/functions/generate-talking-video/index.ts`
  - `src/pages/video/TalkingVideo.tsx`
- No database schema change is required unless we decide to store richer stage fields outside `metadata`.
- The current job may still complete naturally; it is not currently showing an API failure.