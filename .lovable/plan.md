

## Instant Activity Appearance on Workflows Page

### Problem
After enqueueing a generation, `invalidateQueries` is called but the Workflows page `workflow-active-jobs` query polls every 5 seconds. If the user navigates to Workflows between poll cycles, they see no activity for up to 5 seconds.

### Solution: Optimistic Cache Injection

After each successful `enqueue-generation` call in `src/pages/Generate.tsx`, use `queryClient.setQueryData` to **immediately inject** the new job into the `workflow-active-jobs` cache — before (or instead of) invalidating.

### Changes

**`src/pages/Generate.tsx`**

1. Create a helper function `injectActiveJob(queryClient, payload, enqueueResult)` that:
   - Builds an `ActiveJob` object from the enqueue payload and result (jobId, workflow_id, workflow_name, product_name, quality, batch_id, status: 'queued', created_at: now)
   - Calls `queryClient.setQueryData(['workflow-active-jobs'], (old) => [newJob, ...(old ?? [])])`

2. Apply at all enqueue call sites (there are ~4: upscale, single workflow, multi-scene try-on, multi-product batch):
   - After each successful enqueue response, call `injectActiveJob` with the relevant data
   - Keep the existing `invalidateQueries` call so the server state eventually reconciles

### Technical Detail
The injected job object shape matches `ActiveJob` from `batchGrouping.ts`:
```ts
{
  id: result.jobId,
  status: 'queued',
  created_at: new Date().toISOString(),
  started_at: null,
  error_message: null,
  workflow_id, workflow_name, workflow_slug, product_name,
  credits_reserved: result.creditsCost,
  job_type, quality, batch_id,
}
```

This makes the activity card appear instantly when navigating to Workflows — the 5s polling then reconciles with actual server state.

