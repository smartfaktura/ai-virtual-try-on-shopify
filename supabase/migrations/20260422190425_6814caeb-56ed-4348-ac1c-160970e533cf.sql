-- Re-create view with security_invoker so it respects RLS of the caller
drop view if exists public.scene_usage_unified;

create view public.scene_usage_unified
with (security_invoker = true) as
  select scene_id, user_id, created_at, 'freestyle'::text as source
    from public.freestyle_generations
    where scene_id is not null
  union all
  select scene_id, user_id, created_at, 'product_images'::text as source
    from public.generation_jobs
    where scene_id is not null and status = 'completed';

-- The RPC is SECURITY DEFINER and will read the view as definer; explicit admin check inside.
-- Recreate the function to make sure it still attaches to the new view.
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
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Access denied';
  end if;

  return query
    select
      u.scene_id,
      count(*)::bigint as total_uses,
      count(distinct u.user_id)::bigint as unique_users,
      count(*) filter (where u.source = 'freestyle')::bigint as uses_freestyle,
      count(*) filter (where u.source = 'product_images')::bigint as uses_product_images,
      max(u.created_at) as last_used_at,
      min(u.created_at) as first_used_at
    from public.scene_usage_unified u
    where u.created_at >= now() - (p_days || ' days')::interval
    group by u.scene_id
    order by count(*) desc;
end;
$$;

revoke all on function public.get_scene_popularity(int) from public, anon;
grant execute on function public.get_scene_popularity(int) to authenticated;