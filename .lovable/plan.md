

# Short Film Video Generation — Will It Work? **No.** One critical bug remains.

## The Problem: Queue Jobs Never Complete

The generation flow is now correctly routed through the queue:
- `startGeneration` → `enqueueWithRetry` → `process-queue` → `generate-video` (worker mode) ✅
- Worker submits to Kling API and saves `kling_task_id` to `generation_queue.result` ✅
- Credits are deducted atomically via `enqueue_generation` ✅

**But:** The worker is submit-only — it fires the Kling task and returns. The queue job stays in `processing` status forever. The normal video flow (`useGenerateVideo.ts`) solves this by polling `generate-video` with `action: 'status'` + `queue_job_id`, which checks Kling, downloads the video, and marks the queue job `completed`.

The short film's `pollQueueJobCompletion` only reads `generation_queue.status` — it never calls the `status` action. So:
1. Queue job stays `processing`
2. `pollQueueJobCompletion` loops for 10 minutes seeing `processing`
3. Eventually `cleanup_stale_jobs` marks it failed and refunds credits
4. User sees all shots as failed

## The Fix

Update `pollQueueJobCompletion` to match the pattern in `useGenerateVideo.ts`: once the queue job has a `kling_task_id` in its result, call `generate-video` with `action: 'status'` to trigger server-side completion.

### Changes in `src/hooks/useShortFilmProject.ts`

Replace the current `pollQueueJobCompletion` function with one that:

1. First polls `generation_queue` for the job to get `kling_task_id` from `result`
2. Once `kling_task_id` is available, calls `supabase.functions.invoke('generate-video', { body: { action: 'status', task_id: klingTaskId, queue_job_id: jobId } })`
3. If the status response says `succeed` and has `video_url`, return it
4. If `failed`, return null
5. Otherwise keep polling with 10s intervals

```typescript
async function pollQueueJobCompletion(jobId: string, maxPolls: number): Promise<string | null> {
  let klingTaskId: string | null = null;

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 10_000));

    // Phase 1: Get kling_task_id from queue result
    if (!klingTaskId) {
      const { data } = await supabase
        .from('generation_queue')
        .select('status, result, error_message')
        .eq('id', jobId)
        .single();

      if (!data) continue;
      if (data.status === 'failed' || data.status === 'cancelled') return null;
      if (data.status === 'completed') {
        const result = data.result as Record<string, unknown> | null;
        return (result?.video_url as string) || null;
      }

      const result = data.result as Record<string, unknown> | null;
      klingTaskId = (result?.kling_task_id as string) || null;
      if (!klingTaskId) continue;
    }

    // Phase 2: Poll Kling via the status action
    try {
      const { data: statusData } = await supabase.functions.invoke('generate-video', {
        body: { action: 'status', task_id: klingTaskId, queue_job_id: jobId },
      });

      if (statusData?.status === 'succeed' && statusData?.video_url) {
        return statusData.video_url as string;
      }
      if (statusData?.status === 'failed') return null;
    } catch {
      // Continue polling on error
    }
  }
  return null;
}
```

### Files to change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Replace `pollQueueJobCompletion` with status-action polling |

No other files need changes. This is the only remaining blocker — once fixed, video generation will work for all film types.

### Why all film types are equally affected
The `filmType` (product_launch, brand_story, fashion_campaign, etc.) only affects prompt construction via `buildShotPrompt`. The generation pipeline is identical for all types — same queue, same worker, same polling. So this single fix unblocks everything.

