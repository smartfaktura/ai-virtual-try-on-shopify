

## Fix: Duplicate Images & Slow Library Loading

### Problem 1: Duplicate Images
Every freestyle generation is saved to **two** tables:
- The `generate-freestyle` edge function saves to `freestyle_generations`
- The `process-queue` edge function saves to `generation_jobs` for ALL job types (including freestyle)

The Library page fetches from both tables and merges them, so every freestyle image appears twice.

### Problem 2: Slow Loading
The Library makes 2 sequential database queries (generation_jobs + freestyle_generations), each fetching up to 100 rows with joins. Combined with a 10-second auto-refresh interval, this creates unnecessary load.

### Solution

| File | Change |
|------|--------|
| `supabase/functions/process-queue/index.ts` | Skip the `generation_jobs` insert when `job_type === 'freestyle'` (since freestyle already saves to its own table) |
| `src/hooks/useLibraryItems.ts` | Run both queries in parallel using `Promise.all` instead of sequentially; increase `refetchInterval` to 15s |

### Technical Details

**1. Fix duplicates in `process-queue/index.ts` (line 117-135)**

Wrap the `generation_jobs` insert in a condition:

```typescript
// Only save to generation_jobs for non-freestyle jobs
// (freestyle saves to freestyle_generations separately)
if (jobType !== 'freestyle' && generatedCount > 0) {
  await supabase.from("generation_jobs").insert({ ... });
}
```

**2. Speed up Library queries in `useLibraryItems.ts`**

Change the two sequential fetches into parallel ones:

```typescript
const [jobsResult, freestyleResult] = await Promise.all([
  supabase.from('generation_jobs').select(...).order(...).limit(100),
  supabase.from('freestyle_generations').select(...).order(...).limit(100),
]);
```

**3. Clean up existing duplicates**

Run a one-time SQL to delete the duplicate rows in `generation_jobs` that were created by `process-queue` for freestyle jobs (identified by having no `workflow_id` and no `product_id`, with timestamps matching `freestyle_generations`).

```sql
DELETE FROM generation_jobs
WHERE workflow_id IS NULL
  AND product_id IS NULL
  AND prompt_final IS NOT NULL
  AND id IN (
    SELECT g.id FROM generation_jobs g
    JOIN freestyle_generations f
      ON g.user_id = f.user_id
      AND abs(extract(epoch from g.created_at - f.created_at)) < 15
  );
```

### Result
- No more duplicate images in the Library
- Faster loading (parallel queries instead of sequential)
- Future freestyle generations only saved once
