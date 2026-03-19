

## Fix: Incorrect Image Counts in Workflow Activity After Batch Split

### Problem Found

When we split workflow generation into 1-image-per-job batches, the `injectActiveJob` call in `onJobEnqueued` still passes `imageCount: workflowImageCount` (the **total** count, e.g., 3) for **each** individual job. Since `batchGrouping.ts` sums `imageCount` across all jobs in a group, a 3-image workflow now shows **9 total images** (3 jobs x 3) instead of 3 in the Workflows activity card.

The actual queue payload sent by `useGenerationBatch` correctly sets `imageCount` per chunk (1), but the optimistic injection overrides this with the wrong total.

### Fix

**File: `src/pages/Generate.tsx` (line ~1098-1101)**

Change the `onJobEnqueued` callback to pass `imageCount: 1` (per-job count) instead of `workflowImageCount` (total):

```typescript
onJobEnqueued: (jobId) => injectActiveJob(queryClient, {
  jobId, workflow_id: activeWorkflow?.id, workflow_name: activeWorkflow?.name,
  workflow_slug: activeWorkflow?.slug, product_name: productData.title,
  job_type: 'workflow', quality: 'high', imageCount: 1,  // each job = 1 image
}),
```

This aligns the optimistic cache with what the backend actually stores, so the Workflows activity card and batch progress bar show correct counts (e.g., "1/3 images" progressing to "3/3 images").

### Impact
- Workflows activity card: correct image counts and progress bar
- Generate page batch progress: chips and labels match actual job-per-variation mapping
- No backend changes needed — only the optimistic UI injection was wrong

