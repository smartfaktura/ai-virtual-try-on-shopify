-- Recreate get_scene_popularity to aggregate directly from base tables,
-- bypassing the scene_usage_unified view (which had security_invoker issues).
-- Function is SECURITY DEFINER + admin-gated so it safely sees all rows.

DROP FUNCTION IF EXISTS public.get_scene_popularity(integer);

CREATE OR REPLACE FUNCTION public.get_scene_popularity(p_days integer DEFAULT 90)
RETURNS TABLE(
  scene_id text,
  total_uses bigint,
  unique_users bigint,
  uses_freestyle bigint,
  uses_product_images bigint,
  last_used_at timestamp with time zone,
  first_used_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  WITH unified AS (
    SELECT
      fg.scene_id::text AS scene_id,
      fg.user_id,
      fg.created_at,
      'freestyle'::text AS source
    FROM public.freestyle_generations fg
    WHERE fg.scene_id IS NOT NULL
      AND fg.created_at >= now() - (p_days || ' days')::interval

    UNION ALL

    SELECT
      gj.scene_id::text AS scene_id,
      gj.user_id,
      gj.created_at,
      'product_images'::text AS source
    FROM public.generation_jobs gj
    WHERE gj.scene_id IS NOT NULL
      AND gj.created_at >= now() - (p_days || ' days')::interval
  )
  SELECT
    u.scene_id,
    count(*)::bigint AS total_uses,
    count(DISTINCT u.user_id)::bigint AS unique_users,
    count(*) FILTER (WHERE u.source = 'freestyle')::bigint AS uses_freestyle,
    count(*) FILTER (WHERE u.source = 'product_images')::bigint AS uses_product_images,
    max(u.created_at) AS last_used_at,
    min(u.created_at) AS first_used_at
  FROM unified u
  GROUP BY u.scene_id
  ORDER BY count(*) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_scene_popularity(integer) TO authenticated;