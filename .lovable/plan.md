

# Add Per-Workflow Breakdown to Admin Status

## What's Available
The `generation_queue.payload` already stores `workflow_name` and `workflow_slug`. Current data shows clear usage patterns:
- Freestyle (no workflow): 1,038 jobs
- Picture Perspectives: 202
- Virtual Try-On Set: 171
- Selfie / UGC Set: 68
- Product Listing Set: 31
- Product Perspectives: 30
- Mirror Selfie Set: 15
- Flat Lay Set: 3

## Changes

### 1. Update `admin_platform_stats` function (migration)

Add a `workflows_breakdown` key to the returned JSON:

```sql
'workflows_breakdown', (
  SELECT COALESCE(jsonb_agg(row_to_json(w) ORDER BY w.total DESC), '[]'::jsonb)
  FROM (
    SELECT
      COALESCE(payload->>'workflow_name', 'Freestyle (direct)') as name,
      count(*) as total,
      count(*) FILTER (WHERE status = 'completed') as completed
    FROM generation_queue
    GROUP BY payload->>'workflow_name'
    ORDER BY count(*) DESC
  ) w
)
```

### 2. Update `src/pages/AdminStatus.tsx`

Add a **"Workflow Usage"** table below the platform stats grid:
- Columns: Workflow Name | Total Jobs | Completed | Success Rate
- Sorted by total descending
- Uses existing `Table` components
- Loads from the same `platformStats` query (no extra API call)

### Files
- **Migration**: Add `workflows_breakdown` to `admin_platform_stats`
- **`src/pages/AdminStatus.tsx`**: Add workflow table (~30 lines), update `PlatformStats` interface

