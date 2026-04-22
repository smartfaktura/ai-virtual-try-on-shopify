

## Fix inflated "Unique users" KPI on `/app/admin/scene-performance`

### What's wrong

The "Unique users" stat card shows **1,007**, which is not the real unique user count.

Root cause is in `src/pages/admin/SceneUsage.tsx` (line 238):
```ts
const userIdsApprox = enriched.reduce((s, r) => s + Number(r.unique_users), 0);
```

This **sums `unique_users` across every scene row**. A user who used 50 different scenes is counted 50 times. The label even admits it: "Unique users (sum)" / `userIdsApprox`. With ~1,000 scenes in the window, totals naturally balloon to ~1,000+, regardless of real user count.

The RPC `get_scene_popularity` correctly returns `unique_users` **per scene** — that part is fine and useful in the table. The bug is purely in how the KPI aggregates it.

### Safe fix (frontend only — one tiny change)

Get the true distinct-user count from the database instead of summing per-scene values.

#### 1) Add a small admin RPC: `get_scene_unique_user_count(p_days int)`

- `SECURITY DEFINER`, same admin guard as `get_scene_popularity`
- Returns a single integer:
  ```sql
  SELECT count(DISTINCT user_id) FROM (
    SELECT user_id FROM freestyle_generations
      WHERE scene_id IS NOT NULL AND created_at >= now() - (p_days||' days')::interval
    UNION
    SELECT user_id FROM generation_jobs
      WHERE scene_id IS NOT NULL AND created_at >= now() - (p_days||' days')::interval
  ) u;
  ```
- Granted to `authenticated`

#### 2) Use it in `SceneUsage.tsx`

- Call the new RPC alongside `get_scene_popularity` when window changes
- Store result in `uniqueUsers` state
- Replace the KPI value:
  - Card label: "Unique users" (drop "(sum)")
  - Value: `uniqueUsers` (true distinct count)
- Per-scene `unique_users` column in the table stays unchanged

### Why it's safe

- **No change** to generation, credits, queues, or any user data
- **No change** to `get_scene_popularity` (already working)
- **No change** to per-row table data
- One read-only RPC + one KPI value swap
- Trivial rollback (drop RPC, revert one file)

### Validation

1. `/app/admin/scene-performance` reloads cleanly
2. "Unique users" card now shows a realistic small number (matches actual platform user count, not 1,000+)
3. Switching 30d / 60d / 90d updates the value
4. Per-scene "Users" column unchanged
5. Non-admins still blocked

### Untouched

- Generation pipeline, credits, RLS on user data
- `get_scene_popularity` RPC and table rendering
- All other admin pages

