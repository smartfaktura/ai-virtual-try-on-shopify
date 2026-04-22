
## Fix `/app/admin/scene-performance` so it stops hanging and loads fast

### What’s actually still wrong

The page is no longer trying to render all metadata at once, but it still blocks the whole screen on several heavy analytics queries before showing anything.

Current behavior in `src/pages/admin/SceneUsage.tsx`:
- it waits for 4 backend calls together before clearing `loading`
- 3 of those are large aggregate reads:
  - main window popularity
  - last 7 days popularity
  - prior 14 days popularity
- plus a distinct-user count query
- the page keeps the KPI cards and both panels in loading state until all of that finishes

So even with the “show 50 rows first” change, the page can still feel stuck or hang on mobile.

### Safe fix

Use a two-layer fix:

1. Make the page render progressively instead of waiting for everything
2. Speed up the backend queries with proper read indexes and tighter filters

### Changes to make

#### 1) Split the loading state in `src/pages/admin/SceneUsage.tsx`

Replace the single `loading` gate with section-level loading:

- `mainLoading` for:
  - scene list
  - primary KPIs derived from main rows
- `uniqueUsersLoading` for the unique-users KPI only
- `risersLoading` for the risers card only

Result:
- the table and main KPIs render as soon as the main popularity query returns
- unique users can populate a moment later
- top risers can populate separately
- one slow side query no longer freezes the whole page

#### 2) Stop using one `Promise.all` for all analytics

Refactor the load effect so it does this order:

- first:
  - `get_scene_popularity(windowDays)` for the main dataset
- then in parallel, without blocking the page:
  - `get_scene_unique_user_count(windowDays)`
  - risers computation queries

This keeps the page usable even if the risers query is slow.

#### 3) Keep the existing 50-row lazy rendering

Preserve the current safe optimization:
- render only first 50 rows
- “Load more” adds 50 more
- metadata resolves only for visible rows
- CSV still exports the full filtered set

That part is good and should stay.

#### 4) Add proper analytics indexes in a migration

The current indexes lead with `scene_id`, but these analytics functions filter by time window first. That makes them a poor fit for the actual query shape.

Add partial indexes better aligned to the RPCs:

- `freestyle_generations(created_at desc, scene_id, user_id) where scene_id is not null`
- `generation_jobs(created_at desc, scene_id, user_id) where scene_id is not null and status = 'completed'`

This improves:
- main popularity query
- unique user count query
- risers queries

#### 5) Tighten the Product Images analytics filter

Update the analytics functions so `generation_jobs` only counts completed generations for scene usage reporting.

That restores safer semantics and avoids counting queued/failed rows in performance metrics.

#### 6) Add non-blocking fallbacks in the UI

If a secondary query fails:
- main table should still render if main popularity succeeded
- unique users card should show a small fallback like `—`
- risers card should show a compact error/empty state instead of spinner forever

#### 7) Prevent repeated metadata churn

Keep the current lazy metadata behavior, but make it slightly more defensive:
- dedupe missing IDs before fetch
- avoid re-requesting the same missing set while one request is in flight
- keep riser metadata separate from main-table loading so it never blocks the page

### Why this is safe

- keeps the existing admin page structure
- preserves the current 50-row incremental rendering
- does not change generation flow, credits, queues, or user-facing creation flows
- backend change is read-performance only: indexes plus safer analytics filters
- no write permissions or RLS widening needed
- easy rollback:
  - revert one page file
  - drop the new indexes if necessary

### Files likely involved

- `src/pages/admin/SceneUsage.tsx`
- new migration in `supabase/migrations/*` for:
  - analytics indexes
  - updated analytics function filters if needed

### Validation

1. Open `/app/admin/scene-performance`
2. Main KPI cards and first 50 rows appear quickly instead of all cards staying on `—`
3. Unique users can fill in slightly later without blocking the page
4. Top risers can load independently
5. “Load more” still works in 50-row increments
6. Scene names and thumbnails still resolve correctly for visible rows
7. CSV still exports the full filtered dataset
8. Non-admin users remain blocked
9. No endless spinner if a secondary analytics call fails

### Technical details

```text
Before
------
single loading state
  -> waits for:
     main popularity
     unique users
     last 7d popularity
     prior 14d popularity
  -> then render

After
-----
mainLoading
  -> fetch main popularity
  -> render table + main KPIs immediately

secondary async loads
  -> unique users KPI
  -> top risers card
  -> visible-row metadata
```

```text
DB optimization
---------------
Current index shape:
(scene_id, created_at)

Needed query shape:
WHERE created_at >= window
GROUP BY scene_id
COUNT DISTINCT user_id

Better partial index:
(created_at, scene_id, user_id)
```
