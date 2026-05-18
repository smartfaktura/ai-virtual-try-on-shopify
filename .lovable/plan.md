**What’s happening**
- The newest Talking Video finished successfully at **13:02 UTC**.
- Three older Talking Video queue rows are still marked `processing`, but their `generated_videos` rows already completed.
- So the app can show “stuck/generating” even when the actual video record is done, because the queue status and video status are out of sync.

**Why it happens**
- Talking Video uses a two-stage flow: base motion → lip-sync.
- The poller updates `generated_videos` correctly, but some older queue rows kept the previous `kling_task_id` or stage metadata.
- Then `resolveQueueForTask()` can’t match the final provider task back to the queue row, leaving the queue row in `processing` forever.

**Recommended fix**
1. **Repair existing stale rows**
   - Mark queue rows as completed when their linked Talking Video row is already `complete`.
   - Preserve the final `video_url` in `generation_queue.result`.

2. **Harden the poller**
   - Resolve Talking Video queue rows by `metadata.queue_job_id` first, not only by `result.kling_task_id`.
   - Preserve stage metadata when moving base → lip-sync.
   - When a video is completed, always update the linked queue row by queue id.

3. **Add a timeout backstop**
   - If base motion or lip-sync exceeds the allowed window, fail/refund precisely.
   - If base video exists but lip-sync stalls, complete with silent fallback + partial refund instead of showing endless progress.

4. **Clean up UI state**
   - Keep short labels: `Motion`, `Lip-sync`, `Processing`.
   - Treat completed `generated_videos` as authoritative so stale queue rows don’t keep cards “in progress”.

**Technical files likely touched**
- `supabase/functions/poll-stuck-videos/index.ts`
- possible one-time database repair migration for the stale queue rows
- small UI guard in `/app/video` if needed