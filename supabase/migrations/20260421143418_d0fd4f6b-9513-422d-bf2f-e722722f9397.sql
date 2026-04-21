create or replace function public.update_ugc_scene_preview(
  p_label text,
  p_preview_url text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_idx int;
begin
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Admin only';
  end if;

  select i - 1 into v_idx
  from workflows w,
       jsonb_array_elements(w.generation_config->'variation_strategy'->'variations')
         with ordinality as t(elem, i)
  where w.slug = 'selfie-ugc-set'
    and elem->>'label' = p_label
  limit 1;

  if v_idx is null then
    raise exception 'Scene label not found: %', p_label;
  end if;

  update workflows
  set generation_config = jsonb_set(
    generation_config,
    array['variation_strategy','variations', v_idx::text, 'preview_url'],
    to_jsonb(p_preview_url),
    true
  )
  where slug = 'selfie-ugc-set';
end;
$$;