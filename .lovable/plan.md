

## Fix: Group Batch Workflow Jobs in Recent Creations

### Problem

Workflow batches are split into individual 1-image jobs for parallel processing. The "Recent Creations" query fetches the 5 most recent `generation_jobs` rows individually, so a 5-image try-on batch shows as 5 separate "Virtual Try-On Set" cards with "1 imgs" each, instead of 1 grouped card with 5 images and mini-thumbnails.

### Root Cause

The query at line 201 in `Workflows.tsx` uses `.limit(5)` on individual jobs. There's no `batch_id` column on `generation_jobs` — it only exists in the `generation_queue.payload` JSON. Jobs from the same batch share the same `workflow_id`, `product_id`, and are created within seconds of each other.

### Solution

Group completed `generation_jobs` by `workflow_id + product_id` within a 60-second time window (same pattern already used for Picture Perspectives grouping). This merges batch jobs into single cards with all their result images.

### Changes

**File: `src/pages/Workflows.tsx`**

1. Increase the raw fetch limit from 5 → 50 to capture all jobs in recent batches
2. After fetching, group rows by `(workflow_id, product_id)` where `created_at` timestamps are within 60 seconds of each other
3. Merge each group's `results` arrays into a single `RecentJob` entry
4. Slice to 8 grouped entries for display

```text
Before:  5 rows → 5 cards (1 img each)
After:   50 rows → group by batch proximity → ~3-5 cards (multiple imgs each)
```

**Grouping logic** (same pattern as the existing perspectives grouper at line 245):
- Sort by `created_at` descending
- Walk rows; if same `workflow_id + product_id` and within 60s of current group's timestamp → merge
- Otherwise start a new group
- Each group becomes one `RecentJob` with combined results

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Group `generation_jobs` by batch proximity in the `workflow-recent-jobs` query; increase raw limit to 50; output grouped entries |

