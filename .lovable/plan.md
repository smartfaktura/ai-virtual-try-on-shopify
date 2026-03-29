

# Fix: Drop Unnecessary Client INSERT Policy on `generation_jobs`

## Analysis

The `generation_jobs` table has an INSERT policy (`"Users can insert their own jobs"`) that allows any authenticated user to insert rows with arbitrary values for `credits_used`, `status`, `requested_count`, etc. However, **no client-side code performs INSERTs** into this table — all job creation is handled by edge functions (`generate-freestyle`, `generate-workflow`, `cleanup_stale_jobs`, etc.) using `service_role`, which bypasses RLS.

The `freestyle_generations` table also has a client INSERT policy, but that one **is legitimately used** by `useFreestyleImages.ts` to save generation records after the edge function returns. No change needed there.

## Change (1 item)

### Drop the unused INSERT policy on `generation_jobs`

```sql
DROP POLICY "Users can insert their own jobs" ON public.generation_jobs;
```

Edge functions using `service_role` will continue to insert normally since they bypass RLS entirely. No code changes needed.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop `"Users can insert their own jobs"` policy on `generation_jobs` |

