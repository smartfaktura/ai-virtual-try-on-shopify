

## Workflows Audit: Missing Logic, Edge Cases, and Activity Log Proposal

### Current Behavior When User Closes the Window Mid-Generation

**What works well:**
- Jobs are persisted in the `generation_queue` table. Closing the browser does NOT stop the generation -- the backend processes it independently (fire-and-forget architecture).
- Results are saved to `generation_jobs` table with image URLs in the `results` JSONB column.
- The Library page (`/app/library`) shows all completed generation jobs, so results ARE available after closing.
- The `useGenerationQueue` hook has a `restoreActiveJob` effect that re-polls in-progress jobs when the user returns to `/app/generate`.

**What is broken / missing:**
- If the user closes the tab and comes back to `/app/workflows` (not `/app/generate`), they have NO idea that a generation completed or is still running. The Workflows page is a static catalog with zero awareness of job state.
- If they navigate to `/app/library`, they might see results but won't connect them to which workflow produced them.
- There is no notification, banner, or indicator anywhere outside of `/app/generate` that says "your generation is ready."

---

### Identified Gaps and "What If" Scenarios

| # | Scenario | Current Behavior | Risk |
|---|----------|-----------------|------|
| 1 | User starts generation, closes tab | Job completes silently, results in Library | User doesn't know results exist |
| 2 | User starts generation, navigates to Workflows page | No indicator of running/completed job | User might start duplicate generation |
| 3 | User visits Workflows for the first time (no history) | Sees full catalog, no guidance | No sense of progress or achievement |
| 4 | Job fails after tab close | Credits refunded silently | User has no idea failure happened or credits returned |
| 5 | Multiple workflows running concurrently | No consolidated view of all active jobs | User loses track of what's generating |
| 6 | User hits concurrent limit | Error toast only appears on Generate page | No proactive warning on Workflows page |
| 7 | Empty Library after first workflow generation | User sees "No creations yet" with no link back to workflows | Disconnected experience |

---

### Proposed Solution: Workflow Activity Section on Workflows Page

Add an "Activity" section at the top of the Workflows page that shows:

1. **Active Jobs Banner** -- If any `generation_queue` jobs are `queued` or `processing`, show a live status card with workflow name, elapsed time, and a "View Progress" link to `/app/generate?workflow=...`
2. **Recent Completions** -- Show the last 3-5 completed workflow generation jobs (from `generation_jobs` where `workflow_id IS NOT NULL`), with thumbnail previews, workflow name, date, and a "View in Library" link
3. **Layout Logic** -- If user has any activity (active or recent), show the activity section first, then the workflow catalog below with a "New Workflow" section header. If no activity, show the catalog as-is (current behavior).

```text
+--------------------------------------------------+
|  WORKFLOWS                                        |
|  Choose an outcome-driven workflow...             |
|                                                    |
|  [Active Generation Banner - if any]              |
|  "Virtual Try-On Set" is generating... 45s        |
|  [View Progress]                                  |
|                                                    |
|  Recent Creations                                 |
|  +--------+ +--------+ +--------+                |
|  | img    | | img    | | img    |  "View All"    |
|  | VTO    | | Flat   | | Mirror |                |
|  | 2h ago | | 1d ago | | 3d ago |                |
|  +--------+ +--------+ +--------+                |
|                                                    |
|  --- Create a New Set ---                         |
|  [WorkflowCard: Virtual Try-On Set]               |
|  [WorkflowCard: Product Listing Set]              |
|  ...                                              |
+--------------------------------------------------+
```

---

### Technical Implementation Plan

#### 1. Add active job query to Workflows page
- Query `generation_queue` for `status IN ('queued', 'processing')` where `job_type = 'workflow'`
- Poll every 5 seconds while active jobs exist
- Show a compact status card with workflow name (join to `workflows` table via payload's `workflow_id`) and elapsed time
- "View Progress" button navigates to `/app/generate?workflow={id}`

#### 2. Add recent workflow completions query
- Query `generation_jobs` where `workflow_id IS NOT NULL`, `status = 'completed'`, ordered by `created_at DESC`, limit 5
- Join to `workflows(name)` for display name
- Show first result image as thumbnail (with signed URL)
- "View in Library" link

#### 3. Conditional layout
- If active jobs OR recent completions exist, render the Activity section above the catalog
- Add a subtle section divider ("Create a New Set") before the workflow cards
- Keep current layout if user has no workflow history

#### 4. Files to create/modify
- **`src/pages/Workflows.tsx`** -- Add activity queries, conditional rendering, active job banner, recent completions row
- **`src/components/app/WorkflowActivityCard.tsx`** (new) -- Active job status component with polling indicator
- **`src/components/app/WorkflowRecentRow.tsx`** (new) -- Horizontal scroll of recent workflow result thumbnails

#### 5. No database changes needed
- All data already exists in `generation_queue` and `generation_jobs` tables
- RLS policies already allow users to view their own jobs
- `workflow_id` foreign key on `generation_jobs` provides the join

---

### Additional Audit Findings (Lower Priority)

1. **No "generation in progress" indicator in sidebar/nav** -- When a job is running, the sidebar Workflows icon has no badge or pulse. A small dot indicator would help.
2. **Library has no workflow filter** -- Users can't filter Library by workflow type (e.g., "Show only Virtual Try-On results"). The `generation_jobs.workflow_id` is available but not exposed in the UI filter.
3. **No duplicate prevention** -- Nothing stops a user from starting the same workflow with the same product twice. A soft warning ("You generated Virtual Try-On for this product 2 hours ago") would help.
4. **Batch progress lost on navigation** -- If a batch generation (multi-job) is running and user navigates away, `batchState` is lost since it's in-memory React state. Only the last single job is restored via `restoreActiveJob`. The batch aggregation is lost.

