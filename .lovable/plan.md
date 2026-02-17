

## Fix: Batch-Aware Activity on Workflows Page

### Problem

When a generation requires multiple batches (e.g., 2 jobs), the Workflows page shows them as separate activity rows. As one job completes, its row disappears while the other stays -- making it look like something broke. After both finish, images silently appear in "Recent Creations" with no transition or celebration. The user has no idea what happened.

Key issues:
1. Batch jobs appear as separate, unrelated activity rows
2. Completed jobs vanish individually with no feedback
3. No "just finished" state -- jobs go from Activity directly to Recent Creations with no bridge
4. If the user navigates away from the Generate page during batch generation, they lose all batch progress context

### Solution

Group related queue jobs into a single activity row with batch-aware progress, and add a brief "just completed" state so users see a clear transition.

### Changes

**1. `src/pages/Workflows.tsx` -- Group active jobs by batch**

Before passing jobs to `WorkflowActivityCard`, group queue jobs that share the same `workflow_id` + `product_title` and were created within 5 seconds of each other. This creates "batch groups" that represent a single user action.

```text
Before: [Job A (processing), Job B (queued)] -> 2 separate activity rows
After:  [BatchGroup { jobs: [A, B], workflow_name, product_name }] -> 1 activity row
```

Also add a query for "recently completed" queue jobs (completed in last 60 seconds) so we can show a brief "Just finished" state before they appear in Recent Creations.

**2. `src/components/app/WorkflowActivityCard.tsx` -- Render batch groups**

Update the component to accept grouped jobs and render:
- A single row per batch group showing "Generating 2 batches" with a mini progress bar
- Per-batch status: "1 of 2 complete" with a progress indicator
- A "Just finished" state (green) for jobs completed in the last 60 seconds, with a "View Results" link
- Failed batch indication within the group (e.g., "1 of 2 failed -- credits refunded")

### Visual Flow

```text
BEFORE (confusing):
  [Activity]
  | Workflow generation -- Candle Sand  |  PROCESSING  |
  | Workflow generation -- Candle Sand  |  QUEUED      |
  
  (one disappears... then both disappear... images appear in Recent Creations)

AFTER (clear):
  [Activity]
  | Workflow generation -- Candle Sand       |
  | Batch 1 of 2 complete  |  4 images ready |
  | [====------] progress bar                |
  
  (transitions to...)
  
  | Workflow generation -- Candle Sand       |  COMPLETED  |
  | 8 images ready         |  View Results ->            |
  
  (fades out after 60s, appears in Recent Creations)
```

### Technical Details

| Item | Detail |
|------|--------|
| Files changed | `src/pages/Workflows.tsx`, `src/components/app/WorkflowActivityCard.tsx` |
| Grouping logic | Same `workflow_id` + same product title + created within 5s |
| "Just finished" query | `generation_queue` where `status = 'completed'` and `completed_at > now() - 60s` and `payload->workflow_id IS NOT NULL` |
| Recently completed window | 60 seconds (enough time to notice, then fades to Recent Creations) |
| Failed jobs query | Also updated to read from `generation_queue` instead of `generation_jobs` (fixes the earlier invisible failures bug) |
| No DB changes needed | All data already exists in `generation_queue` |

