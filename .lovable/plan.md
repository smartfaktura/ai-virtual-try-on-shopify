

## Reset Scene Performance analytics — keep only yesterday's last freestyle

### What gets done

A single, surgical SQL update. No schema, code, or RLS changes.

```sql
UPDATE generation_jobs
SET scene_id = NULL,
    scene_name = NULL,
    scene_image_url = NULL
WHERE scene_id IS NOT NULL;
```

That's it. `freestyle_generations` is **not** touched — its only row with a `scene_id` is already the swimwear-editorial-lounger from 2026-04-22 you want kept.

### Why this is safe

- **Non-destructive**: zero rows deleted; only 3 analytics columns are nulled
- **Scoped**: `scene_id` / `scene_name` / `scene_image_url` on `generation_jobs` are only consumed by `get_scene_popularity` and `get_scene_unique_user_count` (both filter `WHERE scene_id IS NOT NULL`)
- **No collateral damage**: Library, Activity feed, batch grouping, credits, billing, image URLs in `results` JSONB, storage — all untouched
- **No FKs / triggers** reference these columns
- **Reversible-ish**: rows still exist; only metadata cleared

### Expected result on `/app/admin/scene-performance`

Across all windows (1d / 7d / 30d / 60d / 90d / 360d):

- Scenes used: **1**
- Total generations: **1**
- Freestyle / Product Images: **1 / 0**
- Unique users: **1**
- Table: single row → `pis-swimwear-editorial-lounger-resort`, last used 2026-04-22 19:15
- CSV export: that one row only

### Files changed

None. Pure data update via the data tool.

### Validation

1. Open `/app/admin/scene-performance` → KPIs show 1 / 1 / 1·0 / 1
2. All time windows show only the swimwear lounger row
3. Spot-check user library → all generated images still present, nothing deleted

