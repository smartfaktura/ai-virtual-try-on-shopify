

## Reset Scene Performance tracking — fresh start

Wipe historical scene_id data from `freestyle_generations` and `generation_jobs` so the dashboard starts clean from today, keeping only the one reference row (Sun Lounger Resort Pose generation from 19:15 UTC today).

### What gets cleared

Two columns get nulled out (rows themselves are **not deleted** — your library, credits history, and activity feed stay intact):

1. **`freestyle_generations.scene_id`** → set to `NULL` for all rows **except** the one Sun Lounger Resort Pose generation (`scene_id = 'pis-swimwear-editorial-lounger-resort'` from today ~19:15 UTC).
2. **`generation_jobs.scene_id`** → set to `NULL` for **all** rows (no reference row needed there since the Sun Lounger one lives in `freestyle_generations`).

After this, the `scene_usage_unified` view (which feeds `get_scene_popularity`) will only see that single tracked row → dashboard shows exactly 1 scene with 1 use.

### How

One data migration (uses INSERT/UPDATE tool, not schema migration):

```sql
-- Keep only the most recent Sun Lounger Resort Pose row as reference
UPDATE freestyle_generations
SET scene_id = NULL
WHERE scene_id IS NOT NULL
  AND id <> (
    SELECT id FROM freestyle_generations
    WHERE scene_id = 'pis-swimwear-editorial-lounger-resort'
    ORDER BY created_at DESC
    LIMIT 1
  );

UPDATE generation_jobs
SET scene_id = NULL
WHERE scene_id IS NOT NULL;
```

### Untouched

- No row deletes — only `scene_id` is nulled.
- No schema changes, no edge function changes, no frontend changes.
- KPIs (Total users, Total generations) on other admin pages unaffected — they don't depend on `scene_id`.
- All future generations from now on will be tracked normally.

### Validation

1. Reload `/app/admin/scene-performance` (90d window) → only "Sun Lounger Resort Pose" row visible, 1 use, 1 unique user.
2. Top risers rail → empty or shows just that row in 7d.
3. Generate any new scene → appears immediately on next page load.

