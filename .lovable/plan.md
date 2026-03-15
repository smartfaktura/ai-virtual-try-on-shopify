

## Increase Concurrent Generation Limit to 5 for Pro Plan

### Problem
The database function `enqueue_generation` caps concurrent processing jobs at 4 for the `pro` plan. When Perspectives enqueues 5 angle variations, the 5th job hits this limit and fails. The pre-flight check in the hook also uses 4 as the hard limit.

### Changes

#### 1. Database migration — Raise `max_concurrent` for pro from 4 → 5

Update the `enqueue_generation` function's `v_max_concurrent` CASE statement:

```sql
v_max_concurrent := CASE v_plan
  WHEN 'enterprise' THEN 6
  WHEN 'pro' THEN 5        -- was 4
  WHEN 'growth' THEN 3
  WHEN 'starter' THEN 2
  ELSE 1
END;
```

Also raise the burst limit for pro from 10 → 12 to accommodate 5-image batches comfortably.

#### 2. `src/hooks/useGeneratePerspectives.ts` — Update pre-flight check from 4 → 5

Change line 324:
```typescript
if ((activeJobCount || 0) + totalJobs > 5) {
```

### Files changed
| File | Change |
|------|--------|
| Database migration | Recreate `enqueue_generation` function with pro max_concurrent = 5, burst_limit = 12 |
| `src/hooks/useGeneratePerspectives.ts` | Update pre-flight threshold from 4 to 5 |

