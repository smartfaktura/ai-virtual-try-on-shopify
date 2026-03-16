

## Plan: Fix Dashboard "Images Generated" count

### Problem
The "Images Generated" metric counts **generation job rows** (134 jobs) instead of **actual images produced**. Each job can generate multiple images (`requested_count` field), so the displayed number is significantly lower than reality. Additionally, freestyle generations (stored in `freestyle_generations` table) are not counted at all.

### Changes

**File: `src/pages/Dashboard.tsx`** (lines 178-193)

Replace the current `head: true` row-count query with two queries that sum actual image counts:

1. **Generation jobs**: Select `requested_count` from completed jobs in last 30 days, then sum them client-side (Supabase JS client doesn't support `SUM()` aggregates directly without RPC).
2. **Freestyle generations**: Count rows from `freestyle_generations` in last 30 days (each row = 1 image).
3. Combine both totals for the displayed metric.

```tsx
queryFn: async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const iso = thirtyDaysAgo.toISOString();

  // Sum requested_count from completed generation jobs
  const { data: jobs, error: e1 } = await supabase
    .from('generation_jobs')
    .select('requested_count')
    .eq('status', 'completed')
    .gte('created_at', iso);
  if (e1) throw e1;
  const jobImages = (jobs || []).reduce((sum, j) => sum + (j.requested_count || 0), 0);

  // Count freestyle generations (1 row = 1 image)
  const { count: freestyleCount, error: e2 } = await supabase
    .from('freestyle_generations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', iso);
  if (e2) throw e2;

  return jobImages + (freestyleCount ?? 0);
},
```

This gives the true number of images generated across both workflows and freestyle in the last 30 days.

