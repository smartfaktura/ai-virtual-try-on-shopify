

## Wire scene usage tracking + admin Scene Performance page

Goal: know exactly which scenes/shots get used, by how many users, how often, with **zero impact** on user-facing performance and no risk to existing flows.

### Why today's data isn't usable

- `freestyle_generations.scene_id` exists but only **177 / 2,149 rows** are filled (older rows pre-date the column). New rows are clean.
- `generation_jobs` (Product Images / Catalog / Try-On) only stores `scene_name` text — **1,343 distinct strings for 6,432 rows** (typos, renames, duplicates). Joining by name would mis-count.
- No reliable join to `product_image_scenes.scene_id` or `custom_scenes.id` today.

### Safety + performance guarantees (so nothing breaks)

| Concern | Mitigation |
|---|---|
| Could break user generation? | New column is **nullable**, added next to existing `scene_name`. Edge function edits are one extra optional field inside the existing `insert(...)`. If `payload.pose?.id` is missing → field is `null`, row still inserts, generation still works. |
| Could slow user pages? | **Zero queries added to user code paths.** The new view + RPC are admin-only. No user-facing page reads them. |
| Index write cost? | Two B-tree indexes on `(scene_id, created_at desc)` add ~5–10 µs per insert. Invisible at current rates. |
| RLS / data exposure? | RPC is `SECURITY DEFINER` with inline `has_role(auth.uid(), 'admin')` check — same pattern as `admin_platform_stats`, `admin_generation_stats`, `admin_model_usage_stats` already in production. Non-admins → 0 rows. |
| Reversible? | Drop column + 2 indexes any time. Nullable = no data loss, no app impact. |

### What ships

**1. Migration (one file, additive only)**

```sql
-- add canonical id alongside the legacy scene_name (kept for back-compat)
alter table public.generation_jobs add column if not exists scene_id text;

-- read indexes for the 90-day rollup
create index if not exists idx_generation_jobs_scene_id_created_at
  on public.generation_jobs (scene_id, created_at desc)
  where scene_id is not null;

create index if not exists idx_freestyle_scene_id_created_at
  on public.freestyle_generations (scene_id, created_at desc)
  where scene_id is not null;

-- unified read view (admin RLS still applies via base tables)
create or replace view public.scene_usage_unified as
  select scene_id, user_id, created_at, 'freestyle'::text as source
    from public.freestyle_generations where scene_id is not null
  union all
  select scene_id, user_id, created_at, 'product_images'::text as source
    from public.generation_jobs
    where scene_id is not null and status = 'completed';

-- admin-only RPC, fixed window, returns aggregates only
create or replace function public.get_scene_popularity(p_days int default 90)
returns table (
  scene_id text,
  total_uses bigint,
  unique_users bigint,
  uses_freestyle bigint,
  uses_product_images bigint,
  last_used_at timestamptz,
  first_used_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Access denied';
  end if;
  return query
    select scene_id,
           count(*)::bigint,
           count(distinct user_id)::bigint,
           count(*) filter (where source = 'freestyle')::bigint,
           count(*) filter (where source = 'product_images')::bigint,
           max(created_at), min(created_at)
    from public.scene_usage_unified
    where created_at >= now() - (p_days || ' days')::interval
    group by scene_id
    order by count(*) desc;
end $$;

revoke all on function public.get_scene_popularity(int) from public, anon;
grant execute on function public.get_scene_popularity(int) to authenticated;
```

Returns one row per scene (~1,500 max) → small payload (<100 KB) and <200 ms with the index.

**2. Three edge function edits — write `scene_id` at insert sites**

Each is a single extra line in the existing `insert(...)` call. Wrapped so a malformed payload can never break the insert.

- `supabase/functions/generate-workflow/index.ts` (next to line 985):
  ```ts
  scene_id: (payload.pose as any)?.id ?? payload.scene_id ?? null,
  ```
- `supabase/functions/generate-catalog/index.ts` (next to line 347):
  ```ts
  scene_id: (payload.pose as Record<string, unknown>)?.id as string
            ?? (payload.shot_id as string) ?? null,
  ```
- `supabase/functions/generate-tryon/index.ts` (next to line 638):
  ```ts
  scene_id: (payload.pose as any)?.id ?? null,
  ```

Freestyle (`generate-freestyle/index.ts:1006`) already writes `scene_id` — no change.

Quick frontend audit of the three call sites to confirm `pose.id` is included in `payload` before launch (purely additive if anything's missing).

**3. New admin page — `/app/admin/scene-performance`**

`src/pages/admin/SceneUsage.tsx` (new), registered in `App.tsx` next to `/admin/loading-lab` (line 236). Admin link added to the user menu in `src/components/app/AppShell.tsx` (where `/app/admin/scenes` already lives).

Layout matches `AdminFeedback`, `AdminModels`:

- Header: "Scene & Shot Performance" + window toggle (30 / 60 / 90 days, default 90).
- KPI strip (bordered cards): scenes used · total generations · unique users · freestyle vs product-images split.
- Sortable table (default = total uses desc):
  - Thumbnail (resolved client-side: `product_image_scenes.preview_image_url` → `custom_scenes.image_url` → `—`)
  - Scene name + category (joined from `product_image_scenes` / `custom_scenes`)
  - Source badge (Freestyle · Product Images · Both)
  - Total uses · Unique users · Last used (relative)
- Right rail: "Top 10 risers (last 7d vs prior 7d)" — same RPC twice with delta.
- Client-side search box (filters in-memory over the result set).
- CSV export.

Page only loads on demand; one RPC call, one PIS lookup, one custom_scenes lookup — total <300 ms.

**4. Note on historical data**

Page header shows "Tracking accurate from {migration_date}." Old rows without `scene_id` are excluded — better than mis-counting via `scene_name`.

### Files

**Migration**: 1 file (column + 2 indexes + view + RPC).

**Edge functions edited**: 3 files, 1 line each
- `supabase/functions/generate-workflow/index.ts`
- `supabase/functions/generate-catalog/index.ts`
- `supabase/functions/generate-tryon/index.ts`

**Frontend**:
- `src/pages/admin/SceneUsage.tsx` (new)
- `src/App.tsx` (route at line 237)
- `src/components/app/AppShell.tsx` (admin menu link)

### Validation checklist

1. Generate one Freestyle + one Product Image + one Catalog + one Try-On image → check rows have `scene_id` populated.
2. Visit `/app/admin/scene-performance` as admin → table populates, sorted by uses, thumbnails resolve.
3. Switch 30/60/90 → counts change.
4. Hit RPC as a non-admin user (curl with non-admin JWT) → `42501 Access denied`.
5. Run a generation with `payload.pose` deliberately missing → row still inserts with `scene_id: null`, generation completes normally.
6. `EXPLAIN ANALYZE get_scene_popularity(90)` → uses both new indexes, <200 ms.

### Effort + rollout

~1 day end-to-end. Ship in this order so risk stays at zero:
1. Migration (purely additive — safe).
2. Edge function edits (additive — safe).
3. Admin page (admin-only — safe).

Sorting the public catalog by popularity is a **separate later pass** — this plan only builds the data layer + admin visibility you asked for.

