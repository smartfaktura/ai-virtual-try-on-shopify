

## Optimize `/app/admin/recommended-scenes` thumbnails + fix truncated "Scenes used" count

### Issue 1 — Thumbnails are fetched at full original size

On `/app/admin/recommended-scenes`, both the **Featured** grid and the **All scenes** grid render thumbnails through:
```ts
getOptimizedUrl(scene.preview_image_url, { quality: 60 })
```

Quality-only is correct for full-bleed/hero images, but these are **fixed grid tiles** (≤6 cols, 4:5 aspect, ~180–240 px wide). Loading the original ~2K PNG for each of the 1,000+ tiles is what makes the page heavy on first load.

Per the project's image optimization rule (memory: `image-optimization-no-crop`):
> Quality-only for full-bleed/carousel/background images; **width param is fine for fixed thumbnails.**

These admin grid tiles qualify as fixed thumbnails.

### Issue 2 — "Scenes used 1000" is a silent truncation, not a real value

`get_scene_popularity` actually returns **1,063 rows** (verified against the database). The client only receives **1,000** because PostgREST applies a default 1,000-row cap to RPC responses unless an explicit range is requested. The KPI then reports `enriched.length === 1000`.

This is the same root cause the AdminRecommendedScenes page already works around with paged fetching (`HARD_CAP = 5000`).

### Fix

Frontend-only, in two files.

#### 1) `src/pages/AdminRecommendedScenes.tsx` — optimize grid thumbnails

Replace both `getOptimizedUrl(..., { quality: 60 })` calls (Featured grid + All scenes grid) with:
```ts
getOptimizedUrl(scene.preview_image_url, { width: 320, quality: 60 })
```

`width: 320` covers retina (2x) for ~160 px tiles up through the densest 6-col layout. Massive bandwidth/render reduction with no visible quality drop. No layout/CSS changes needed — the `<ShimmerImage>` wrapper already enforces `aspect-[4/5]`.

Result: each tile drops from ~2 MB to ~30–60 KB.

#### 2) `src/pages/admin/SceneUsage.tsx` — fetch all popularity rows past the 1k cap

In the main popularity load (the `get_scene_popularity` call around line 187), explicitly request a larger range so PostgREST returns the full set:

```ts
const popRes = await supabase
  .rpc('get_scene_popularity' as any, { p_days: windowDays })
  .range(0, 9999);
```

This restores the true count (~1,063 today) and keeps the existing 50-row visible pagination intact — the rendering side already lazy-resolves metadata only for visible rows, so the cost stays low.

Same `.range(0, 9999)` is added to the two risers calls (`p_days: 7` and `p_days: 14`) for consistency, in case they ever cross the 1k threshold.

### Why it's safe

- **Frontend only**, two files, no DB / RPC / RLS / edge function changes
- Thumbnail change uses an officially-allowed pattern (fixed thumbnails) per the project's image-optimization rule
- `.range(0, 9999)` is a standard PostgREST pagination hint; it doesn't change RPC behavior, only widens the response window
- KPI cards, table, sort, search, CSV, "Load more", risers — all keep working
- Generation pipeline, queues, credits — untouched
- Trivial rollback: revert the two files

### Validation

1. `/app/admin/recommended-scenes` loads visibly faster, especially scrolling through the All scenes grid; thumbnails look identical
2. Network panel shows thumbnail responses ~30–60 KB instead of multi-MB
3. `/app/admin/scene-performance` "Scenes used" KPI now shows the real number (~1,063 for 90d), not a flat 1,000
4. Switching 30d / 60d / 90d updates the count to the true value for that window
5. Top risers still load and resolve names/thumbnails
6. CSV export still contains all rows (now uncapped)

### Files

- `src/pages/AdminRecommendedScenes.tsx` — add `width: 320` to two `getOptimizedUrl` calls
- `src/pages/admin/SceneUsage.tsx` — add `.range(0, 9999)` to the three `get_scene_popularity` RPC calls

