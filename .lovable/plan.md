# Raise per-user burst limits

Update the `enqueue_generation` RPC so the 60-second per-user burst cap matches the new plan tiers. Burst is per user (confirmed via the `WHERE user_id = p_user_id` filter), so one user cannot affect others.

## Changes

| Plan | Current | New |
|---|---|---|
| Free | 15 | 15 (unchanged) |
| Starter | 40 | 100 |
| Growth | 80 | 200 |
| Pro | 200 | 300 |
| Enterprise | 300 | 300 (unchanged) |

## Implementation

Single `CREATE OR REPLACE FUNCTION public.enqueue_generation(...)` migration. Body is identical to current — only the `v_burst_limit` CASE values change:

```sql
v_burst_limit := CASE v_plan
  WHEN 'enterprise' THEN 300
  WHEN 'pro' THEN 300
  WHEN 'growth' THEN 200
  WHEN 'starter' THEN 100
  ELSE 15
END;
```

No changes to credit deduction, priority scoring, first-gen event logging, or `generation_queue` insert. No app or edge-function code references these numbers, so nothing downstream needs updating.

## Out of scope

- UI changes
- Provider concurrency caps
- Outfit Changer's 3-parallel-chain cap

## Safety

Instantly reversible by re-running the function with old values. No schema, RLS, or behavior changes.
