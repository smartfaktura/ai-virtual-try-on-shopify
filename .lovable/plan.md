

## Workflows Page: Capping, Failed Jobs, and Loading Polish

### What's Already Safe

The recent completions query already uses `.limit(5)`, so even with 500 completed workflow jobs, only the 5 most recent thumbnails are shown. The "View All" button correctly links to the Library for the full history. No changes needed here.

### What's Missing

#### 1. Failed jobs are completely invisible
Currently the Workflows page queries:
- Active: `status IN ('queued', 'processing')` from `generation_queue`
- Recent: `status = 'completed'` from `generation_jobs`

If a job **fails**, it disappears from the active query (no longer queued/processing) and never appears in recent (not completed). The user has zero visibility into failures.

**Fix:** Add a third query for recently failed jobs (last 24 hours, limit 3) and show them in a compact error card with the workflow name, failure time, and a dismissible "Retry" or "View Details" option.

#### 2. No "just completed" success feedback
When a processing job finishes, it simply vanishes from the Active section. There's no transitional "Done!" state -- it jumps straight to the Recent row (if the user refreshes). This feels jarring.

**Fix:** Query recently completed jobs from the last 5 minutes alongside active jobs, and show them in the same `WorkflowActivityCard` component with a green checkmark and "Completed" badge. They auto-dismiss after 5 minutes.

#### 3. No loading skeleton for the activity section
The `workflow-recent-jobs` query might take a moment, but the activity section either shows nothing or shows data. No shimmer/skeleton while loading.

**Fix:** Add a compact skeleton row (3 shimmer thumbnail cards) when `isLoadingRecent` is true.

### Technical Changes

**`src/pages/Workflows.tsx`**
- Add a query for recently failed jobs: `generation_jobs` where `status = 'failed'`, `workflow_id IS NOT NULL`, `created_at > now() - 24h`, limit 3
- Add a query for just-completed jobs: `generation_jobs` where `status = 'completed'`, `workflow_id IS NOT NULL`, `created_at > now() - 5min`, limit 3 (shown as success cards in the active section)
- Pass `isLoadingRecent` to `WorkflowRecentRow` to show skeleton thumbnails during load
- Update `hasActivity` to also check for failed jobs and just-completed jobs

**`src/components/app/WorkflowActivityCard.tsx`**
- Accept a new `completedJobs` and `failedJobs` prop alongside existing `jobs` (active)
- Render completed jobs with a green `CheckCircle2` icon, "Completed" badge, and "View in Library" link
- Render failed jobs with a red `XCircle` icon, "Failed" badge, error message snippet, and optional "Retry" link back to the generate page
- Completed cards auto-hide after 5 minutes (already handled by the query filter)

**`src/components/app/WorkflowRecentRow.tsx`**
- Accept an `isLoading` prop
- When true, render 3 skeleton thumbnail cards (shimmer squares with text placeholders) instead of real data
- Keeps the layout stable while signed URLs and job data are being fetched

### What stays the same
- The `.limit(5)` cap on recent jobs -- safe with any volume
- The "View All" link to Library for full history
- Active job polling (5-second interval)
- All existing animations and thumbnail rendering

### Summary of states a user can see

```text
+--------------------------------------------------+
| WORKFLOWS                                         |
|                                                    |
| Active Generations (if any)                       |
| [spinner] "Virtual Try-On" generating... 45s      |
| [check]   "Flat Lay Set" completed just now       |
| [x]       "Product Listing" failed 10m ago        |
|                                                    |
| Recent Creations            [View All ->]         |
| [shimmer] [shimmer] [shimmer]  (while loading)    |
| [thumb1]  [thumb2]  [thumb3]   (when loaded)      |
|                                                    |
| --- Create a New Set ---                          |
| [WorkflowCard catalog...]                         |
+--------------------------------------------------+
```
