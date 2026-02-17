

## Fix: Workflow Activity Not Showing + Remove Duplicate Completed Jobs

### Problem 1: Active workflows don't appear in Activity

**Root cause found in database:** Workflow jobs are enqueued with `job_type: 'tryon'` (or `'product'`, `'freestyle'` depending on the workflow type), NOT `'workflow'`. However, they do carry a `workflow_id` in their `payload` JSON.

The current filter on line 46 of `Workflows.tsx`:
```typescript
.filter((j) => j.job_type === 'workflow')
```
...matches zero rows because no jobs ever have `job_type === 'workflow'`. Verified in database: the most recent workflow generations all have `job_type: 'tryon'` with `payload.workflow_id` set.

**Fix:** Instead of filtering by `job_type`, filter by the presence of `workflow_id` in the payload. Since `payload` is JSONB, we can't easily filter server-side with the JS client, so we filter client-side by checking if `payload.workflow_id` exists.

### Problem 2: Completed jobs show in both Activity AND Recent Creations

The "just completed" green cards in Activity are redundant with the Recent Creations thumbnails below. Same data, shown twice.

**Fix:** Remove the `justCompletedJobs` query entirely. Completed workflows should only appear in the Recent Creations row. The Activity section should only show actively running/queued jobs and failures -- things that need attention.

### Changes

**`src/pages/Workflows.tsx`**
- Change the active jobs filter from `j.job_type === 'workflow'` to checking for `workflow_id` in the payload JSONB
- Remove the `justCompletedJobs` query (lines 66-89) entirely
- Update `hasActivity` to no longer reference `justCompletedJobs`
- Remove `completedJobs` prop from `WorkflowActivityCard`
- Enable polling (refetchInterval) on the active jobs query even when empty (e.g., every 15s) so newly started jobs appear without a page refresh

**`src/components/app/WorkflowActivityCard.tsx`**
- Remove the `completedJobs` prop and all green "Completed" card rendering
- Keep only active (queued/processing) and failed job cards

### Technical Details

Current DB data shows workflow jobs look like:
```
job_type: "tryon"
payload: { workflow_id: "021146a4-...", ... }
```

The fix changes the filter to:
```typescript
// Before (broken):
.filter((j) => j.job_type === 'workflow')

// After (works):
.filter((j) => {
  const p = j.payload as Record<string, unknown> | null;
  return p?.workflow_id != null;
})
```

This correctly catches all workflow-originated jobs regardless of their underlying job type (tryon, product, freestyle).
