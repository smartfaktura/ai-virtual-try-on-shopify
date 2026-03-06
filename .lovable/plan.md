

## Problem: Batch Jobs Not Grouped in Activity

When generating 2 variations, each variation becomes a separate queue job (MAX_IMAGES_PER_JOB = 1). The batch grouping in `batchGrouping.ts` groups jobs by matching `workflow_id` + `product_name` within a **5-second window**. But since jobs are enqueued **sequentially** (each `await`s the edge function response), if the edge function takes >5 seconds, the second job falls outside the grouping window and appears as a separate activity entry — or doesn't group at all.

Additionally, the activity card doesn't show variation count info (e.g., "2 images" or "1 of 2") for single-appearing jobs.

### Fix

**1. Add a `batch_id` to the payload** (`useGenerationBatch.ts`)
- Generate a unique `batch_id` (e.g., `crypto.randomUUID()`) before the enqueue loop
- Include it in each chunk's payload so all jobs from the same user action share the same identifier

**2. Update batch grouping** (`batchGrouping.ts`)  
- Group by `batch_id` first (if present in payload), falling back to the current time-window heuristic
- This guarantees jobs from the same generation are always grouped regardless of enqueue timing

**3. Extract `batch_id` in Workflows page** (`Workflows.tsx`)
- Read `batch_id` from `payload` when mapping active/completed/failed jobs into `ActiveJob`
- Pass it through to the grouping function

**4. Update `ActiveJob` interface** (`batchGrouping.ts`)
- Add optional `batch_id?: string` field

### Files changed
- `src/hooks/useGenerationBatch.ts` — add `batch_id` to chunk payloads
- `src/lib/batchGrouping.ts` — group by `batch_id` when available; update `ActiveJob` interface
- `src/pages/Workflows.tsx` — extract `batch_id` from payload when mapping jobs

