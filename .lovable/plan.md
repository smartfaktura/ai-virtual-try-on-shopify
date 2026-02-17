

## Fix: Workflow Activity Card UX and Live Updates

### Issues Identified

1. **"View" button on active jobs is misleading** -- navigates to the generate page which doesn't show the in-progress job. Remove it entirely.
2. **Activity card shows generic "Workflow generation"** instead of the actual workflow name and product name. The payload already contains `workflow_name` (mapped from `p?.workflow_name`) but it's often null because the enqueue payload doesn't always include it. The product name is available in `payload.product.title`.
3. **No live refresh** -- active jobs poll every 15 seconds, and when a job completes, the "Recent Creations" list doesn't update until the user refreshes the page.

### Changes

**1. `src/components/app/WorkflowActivityCard.tsx`**

- Remove the "View" button and its ArrowRight icon from active jobs
- Display product name from the payload (passed as a new prop `product_name`)
- Show the workflow name more prominently (already partially working via `job.workflow_name`)
- Keep the "Retry" button on failed jobs (it makes sense there)

**2. `src/pages/Workflows.tsx`**

- Extract `product_name` from the payload (`p?.product?.title`) and pass it through to `WorkflowActivityCard`
- Increase polling frequency for active jobs from 15s to 5s for near-live feedback
- When active jobs transition from non-empty to empty (meaning jobs just completed), automatically invalidate the `workflow-recent-jobs` query so Recent Creations updates instantly
- Add a `useEffect` that watches `activeJobs.length` and triggers a refetch of recent jobs when it drops to 0

### Technical Details

**WorkflowActivityCard changes:**
- Add `product_name?: string | null` to `ActiveJob` interface
- Show product name as subtitle: "Virtual Try-On Set -- Ring with diamonds"
- Remove `Button` with "View" and `ArrowRight` for active jobs (lines 84-92)

**Workflows.tsx changes:**
- Map `product_name` from payload: `(p?.product as any)?.title as string ?? null`
- Change `refetchInterval` from `15_000` to `5_000` for active jobs
- Add `useEffect` watching `activeJobs.length === 0` to `queryClient.invalidateQueries({ queryKey: ['workflow-recent-jobs'] })`
- Import `useQueryClient` from tanstack

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/WorkflowActivityCard.tsx` | Remove "View" button, show product name |
| `src/pages/Workflows.tsx` | Extract product_name, faster polling, auto-refresh recent creations on completion |

