

## Optimize `/app/admin/scene-performance` — paginated loading

### Problem

The dashboard currently loads **all** scene rows (1,000+) at once, plus metadata for every single ID. This causes slow load and renders a massive table the admin scrolls through anyway.

### Fix (frontend-only, safe)

Render only the first **50 rows** by default, with a **"Load more"** button that reveals 50 more at a time. Metadata is fetched only for the rows that are actually visible — keeping the network footprint small.

### Changes to `src/pages/admin/SceneUsage.tsx`

1. **New state**: `visibleCount` (default `50`), `loadingMore` flag.
2. **KPIs and totals** stay computed from the full `rows` set (so "Scenes used", "Total generations", etc. remain accurate platform-wide numbers).
3. **Sorting + search** apply to the full dataset (so search finds anything, not just the loaded slice).
4. **Display slice**: `const visible = filtered.slice(0, visibleCount);` — only this slice is rendered in the table.
5. **Metadata fetching becomes lazy**:
   - Initial load: fetch popularity rows + unique-user count + risers (cheap RPCs, no per-scene metadata).
   - Whenever `visible` changes, look up metadata only for IDs in the visible slice that aren't already in the `meta` map. Same for risers (always 10, fetched once).
   - Reuse the existing chunked `fetchInChunks` helper at chunk size 200 (single batch for 50 IDs).
6. **"Load more" button** below the table:
   - Visible only when `visibleCount < filtered.length`.
   - Shows "Load more (X remaining)".
   - Increments `visibleCount` by 50.
7. **Reset `visibleCount` to 50** whenever `windowDays`, `search`, `sortKey`, or `sortDir` changes.
8. **CSV export** keeps exporting the full filtered set (not just visible) — admins expect complete data in CSV.

### Why it's safe

- Frontend-only change in one admin page
- No DB schema, RPC, RLS, or edge function changes
- Generation pipeline, credits, queues — untouched
- KPI numbers stay correct (computed from full dataset)
- CSV export stays complete
- Easy rollback: revert one file

### Validation

1. Reload `/app/admin/scene-performance` → loads visibly faster
2. Table shows 50 rows initially with thumbnails + names
3. "Load more" button appears below table; clicking adds 50 more rows with thumbnails
4. Sorting/search resets to first 50; works across full dataset
5. KPI cards still show full totals (1,000 scenes, 4,966 generations, 4 unique users)
6. CSV export still contains all rows
7. Top risers rail unchanged

