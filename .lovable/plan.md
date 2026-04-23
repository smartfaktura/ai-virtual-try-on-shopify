

## Why `/app/admin/scene-performance` is still slow + fix

### Root causes (verified from code)

**1) Thumbnails are unoptimized in this page (the previous fix only touched the recommended-scenes page)**

In `src/pages/admin/SceneUsage.tsx`:
- Main table (line 435): `<img src={r.thumbnail} ... className="w-10 h-10" />`
- Risers rail (line 487): `<img src={m.thumbnail} ... className="w-7 h-7" />`

Both render raw Supabase Storage URLs — no `getOptimizedUrl()` call. Each 40×40 px tile downloads the **full ~2 MB original PNG**. With 50 rows visible, that's ~100 MB of thumbnail traffic on initial render alone.

**2) Three large RPC payloads load up front**

The recent change added `.range(0, 9999)` to:
- `get_scene_popularity(90d)` → ~1,063 rows
- `get_scene_popularity(7d)` (risers)
- `get_scene_popularity(14d)` (risers)

That's 3 large aggregate payloads on first paint. The 90d list is needed for KPI totals, but risers only needs the top 10 — they don't need 1,000+ rows each.

**3) Initial metadata batch is bigger than necessary**

When 50 visible rows hit the lazy-meta effect at once, the in-clause query against `product_image_scenes` plus the riser-meta query both fire near-simultaneously, multiplying the burst.

### Fix (frontend-only, one file)

`src/pages/admin/SceneUsage.tsx`:

1. **Optimize both thumbnail renders** — wrap the two `<img src={...}>` calls with `getOptimizedUrl(url, { width: 80, quality: 60 })`. 80 px width covers retina (2×) for the 40 px tiles and 28 px riser tiles. Drops each tile from ~2 MB to ~10–20 KB.

2. **Cap the risers payload** — risers only needs a small set. Replace the two `.range(0, 9999)` risers calls with `.range(0, 499)`. 500 rows is more than enough to compute top-10 risers and cuts the secondary payload by ~50%.

3. **Keep main popularity at `.range(0, 9999)`** — required for accurate "Scenes used" KPI (the very thing we just fixed).

4. **Defer riser metadata until after main meta resolves** — small reorder so the visible-row meta batch isn't competing with the riser meta batch on first paint.

### Why this is safe

- One file changed, frontend-only
- No DB / RPC / RLS / edge function changes
- Uses the project's allowed `width:` pattern for fixed thumbnails (per `image-optimization-no-crop` memory)
- KPI numbers and pagination behavior unchanged
- CSV export unchanged
- Trivial rollback

### Validation

1. Reload `/app/admin/scene-performance` → first 50 rows + main KPIs paint quickly
2. Network panel: thumbnail responses ~10–20 KB instead of ~2 MB
3. Risers card still shows correct top-10 with thumbnails
4. "Scenes used" still shows ~1,063 (not truncated)
5. "Load more" still works in 50-row increments with optimized thumbnails

