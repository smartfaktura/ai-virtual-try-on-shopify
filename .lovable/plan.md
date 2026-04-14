

# Fix: `video_multishot` Jobs Never Get Dispatched

## The Bug

`process-queue/index.ts` maps job types to edge functions. It has `video: "generate-video"` but **no entry for `video_multishot`**. When the short film enqueues a `video_multishot` job, `process-queue` doesn't know which function to call — so the job sits in the queue indefinitely and never starts.

## Fix

### File: `supabase/functions/process-queue/index.ts`

Add one line to the `JOB_TYPE_TO_FUNCTION` map:

```typescript
const JOB_TYPE_TO_FUNCTION: Record<string, string> = {
  tryon: "generate-tryon",
  freestyle: "generate-freestyle",
  workflow: "generate-workflow",
  upscale: "upscale-worker",
  video: "generate-video",
  video_multishot: "generate-video",   // ← ADD THIS
  catalog: "generate-catalog",
  "text-product": "generate-text-product",
};
```

Both `video` and `video_multishot` route to the same `generate-video` edge function — the function already branches on `job_type` internally (line 318).

### Deploy

Redeploy `process-queue` edge function after the change.

| File | Change |
|------|--------|
| `supabase/functions/process-queue/index.ts` | Add `video_multishot: "generate-video"` to job type map |

One line fix. Without it, short film generation is completely broken.

