

## Show Picture Perspectives in Workflows Recent Creations

### Problem
Picture Perspectives results are stored in `freestyle_generations` (not `generation_jobs`), so the "Recent Creations" query on the Workflows page never finds them. The query only checks `generation_jobs.workflow_id IS NOT NULL`.

### Solution
Add a second query for recent perspective generations from `freestyle_generations`, group them into "jobs" by time proximity, and merge them into the `recentJobs` array.

### Changes

**`src/pages/Workflows.tsx`** — Add a new query + merge logic:

1. **New query `workflow-recent-perspectives`**: Query `freestyle_generations` where `workflow_label` starts with `'Picture Perspectives'`, ordered by `created_at desc`, limit 50, from the last 7 days.

2. **Group into synthetic jobs**: Group consecutive `freestyle_generations` rows that share the same `workflow_label` prefix ("Picture Perspectives") and are within 10 minutes of each other into a single "job" object matching the `RecentJob` interface:
   - `id`: first row's id
   - `workflow_id`: `'perspectives'`
   - `workflow_name`: `'Picture Perspectives'`
   - `created_at`: earliest in group
   - `results`: array of `{ url: image_url }` from all rows in the group
   - `requested_count`: actual count of images in the group

3. **Merge & sort**: Combine `recentJobs` (from `generation_jobs`) with the grouped perspective jobs, sort by `created_at desc`, and take the top 5-8.

**`src/components/app/WorkflowRecentRow.tsx`** — Fix image count badge:
- Line 95: Change `{job.requested_count} imgs` to use `results` array length when available (since `requested_count` may differ from actual completed count). Use: `{(Array.isArray(job.results) ? (job.results as unknown[]).length : job.requested_count)} imgs`

### Files changed
| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Add `freestyle_generations` query for perspectives, group + merge into `recentJobs` |
| `src/components/app/WorkflowRecentRow.tsx` | Show actual image count from results array |

