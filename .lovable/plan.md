

## Phase 2 Bug Fixes: Queue Table and Enqueue Endpoint

### Bug 1: Concurrent Job Limit Not Enforced (Critical)

The `enqueue_generation` SQL function calculates `v_concurrent` (current processing jobs) and `v_max_concurrent` (plan limit) but never actually blocks the enqueue when the limit is reached. This means any user can have unlimited concurrent jobs.

**Fix**: Add a check after computing both values:

```sql
IF v_concurrent >= v_max_concurrent THEN
  RETURN jsonb_build_object(
    'error', 'Too many concurrent generations',
    'max_concurrent', v_max_concurrent
  );
END IF;
```

This requires a SQL migration to replace the `enqueue_generation` function.

Also need to handle this new error in `enqueue-generation/index.ts` -- return a 429 status when the error contains "concurrent".

---

### Bug 2: Position Calculation Off-by-Many

The position query in `enqueue_generation` uses `created_at < now()` for tie-breaking, but `now()` is the current transaction time, not the new job's `created_at`. Since all existing jobs were created before `now()`, every same-priority job gets counted, inflating position.

**Fix**: Use the newly inserted job's ID to exclude it and compare `created_at` properly:

```sql
SELECT count(*) INTO v_position
FROM generation_queue
WHERE status = 'queued' AND id != v_job_id
  AND (priority_score < v_priority
    OR (priority_score = v_priority
        AND created_at < (SELECT created_at FROM generation_queue WHERE id = v_job_id)));
```

This is included in the same SQL migration.

---

### Bug 3: Remove Dead Import

Remove unused `addCredits` import from `useGenerationQueue.ts` (line 47).

**File**: `src/hooks/useGenerationQueue.ts`

Change:
```typescript
const { addCredits } = useCredits();
```
To remove this line entirely (and the `useCredits` import if no longer needed).

---

### Summary

| Change | File |
|--------|------|
| SQL migration: add concurrent limit check + fix position calculation | New migration file |
| Handle "concurrent" error as 429 in edge function | `supabase/functions/enqueue-generation/index.ts` |
| Remove dead `addCredits` import | `src/hooks/useGenerationQueue.ts` |
| Handle 429 "concurrent" error in frontend | `src/hooks/useGenerationQueue.ts` |

### Implementation Order

1. SQL migration (concurrent check + position fix)
2. Edge function error handling for concurrent limit
3. Frontend cleanup and concurrent error handling

