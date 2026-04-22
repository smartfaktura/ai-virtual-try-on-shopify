

## Fix `/app/admin/scene-performance` loading forever

### What’s actually broken

The issue is now in the **admin read path**, not in generation tracking:

- Recent Product Images rows are being recorded correctly again:
  - `"Frozen Aura"` now has non-null `scene_id` values in `generation_jobs`
- The underlying data source is not empty:
  - `scene_usage_unified` currently contains thousands of rows in the 90d window
- So the page is hanging because the **RPC/query path the admin page depends on is misconfigured**

### Most likely root cause

`src/pages/admin/SceneUsage.tsx` loads through:

```ts
supabase.rpc('get_scene_popularity', { p_days: windowDays })
```

But the backend setup around that RPC is fragile right now:

1. `get_scene_popularity()` appears to have **permission/exposure problems** in the live database
2. `scene_usage_unified` was recreated with `security_invoker = true`, which makes reads depend on the caller’s direct table access/RLS
3. The base tables behind it (`freestyle_generations`, and likely other scene sources) are user-scoped, so this is the wrong pattern for an admin-wide aggregate

That combination can leave the admin page waiting on a broken RPC path instead of getting a usable aggregate.

### Safe fix plan

#### 1) Harden the admin aggregation function
Update the migration setup so `public.get_scene_popularity(p_days int)` is the single reliable admin entry point:

- keep it `SECURITY DEFINER`
- keep the explicit admin check:
  ```sql
  if not public.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Access denied';
  end if;
  ```
- make sure it is recreated cleanly and **granted to authenticated users**
- verify it is callable from the client

#### 2) Remove the fragile dependency on `security_invoker` for admin analytics
Replace the current read path with one of these safe patterns:

- safest option: have `get_scene_popularity()` aggregate directly from base tables
- acceptable option: recreate `scene_usage_unified` without `security_invoker = true` and keep access only through the admin RPC

This ensures admin analytics are not blocked by per-user RLS on source tables.

#### 3) Keep the UI unchanged
`src/pages/admin/SceneUsage.tsx` can stay mostly as-is. Only add a tiny defensive improvement if needed:

- ensure RPC failures surface a clear toast/message
- optionally render an inline error state instead of a spinner if the RPC fails

### What will not be touched

- No changes to image generation logic
- No changes to credits, queueing, or AI calls
- No changes to the Product Images frontend payload fix
- No schema redesign needed
- No risky refactor of the admin page UI

### Why this is safe

- This is an **analytics read-path fix only**
- It does not touch the generation pipeline
- It does not mutate existing image results
- It only corrects how admin scene-performance aggregates are fetched

### Validation

1. Call `get_scene_popularity(90)` successfully as an authenticated admin
2. Open `/app/admin/scene-performance`
3. Confirm KPI cards populate instead of showing endless loading
4. Confirm the table renders rows
5. Confirm recent Product Images generations like `"Frozen Aura"` appear
6. Confirm the page still blocks non-admin users

### Expected outcome

After this fix:

- `/app/admin/scene-performance` stops hanging
- existing tracked rows render again
- new Product Images generations appear normally
- admin analytics no longer depend on fragile caller-side RLS behavior

