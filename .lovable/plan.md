

# Fix: Workflow Activity Showing Wrong Progress

## Problem
Jobs from the same batch are grouped **independently** across three separate queries (active, completed, failed). When job #3 of 5 completes, it leaves the "active" group — the remaining 2 active jobs show "0/5 images" because their completed siblings aren't counted. Similarly, the completed query doesn't include `imageCount` or `generatedCount` fields, so completed groups show wrong counts too.

## Root Cause (confirmed in code)
- **Line 355**: `activeBatchGroups = groupJobsIntoBatches(activeJobs)` — only queued/processing
- **Line 356**: `completedBatchGroups = groupJobsIntoBatches(recentlyCompletedJobs)` — only completed, and missing `imageCount`/`generatedCount` fields
- **Line 358**: `failedBatchGroups = groupJobsIntoBatches(recentlyFailedJobs)` — only failed, also missing those fields
- No realtime subscription needed — existing polling (5s active, 10s completed) handles updates without page refresh

## Solution: Merge before grouping, then categorize

### File: `src/pages/Workflows.tsx`

1. Add `result` to the completed + failed job queries (lines 116, 155) so `imageCount`/`generatedCount` are available
2. Add `credits_reserved` to completed + failed queries
3. Replace the three independent `groupJobsIntoBatches` calls (lines 355-359) with:
   - Merge all three arrays, deduplicate by `id`
   - Call `groupJobsIntoBatches` once on the merged set
   - Split resulting groups into active/completed/failed based on job statuses within each group:
     - **active**: any job is `queued` or `processing`
     - **completed**: all jobs terminal AND at least 1 completed
     - **failed**: all jobs terminal AND 0 completed (all failed)

### File: `src/components/app/WorkflowActivityCard.tsx`

4. Update `ActiveGroupCard` progress display — it already reads `group.generatedImageCount` / `group.totalImageCount`, which will now be correct because completed siblings are in the same group
5. Update failed group card to show partial success when `group.completedCount > 0` alongside failures (e.g. "2 failed · 3 images saved")

### File: `src/lib/batchGrouping.ts`

6. No changes needed — `groupJobsIntoBatches` already handles mixed statuses correctly via `batch_id` and time-window grouping

## Performance
- No additional network requests — same 3 queries, just merged client-side
- No new polling intervals — keeps existing 5s/10s cadence
- No realtime subscriptions needed — polling already handles live updates
- Deduplication is O(n) with a Set, no performance impact

## Scope
- 2 files modified: `Workflows.tsx`, `WorkflowActivityCard.tsx`
- No backend/migration changes
- No edge function changes

