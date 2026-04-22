
-- Partial indexes optimized for time-windowed analytics queries
CREATE INDEX IF NOT EXISTS idx_freestyle_gens_analytics
  ON public.freestyle_generations (created_at DESC, scene_id, user_id)
  WHERE scene_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_generation_jobs_analytics
  ON public.generation_jobs (created_at DESC, scene_id, user_id)
  WHERE scene_id IS NOT NULL AND status = 'completed';

-- Tighten analytics: only count completed product-image jobs
CREATE OR REPLACE FUNCTION public.get_scene_popularity(p_days integer DEFAULT 90)
 RETURNS TABLE(scene_id text, total_uses bigint, unique_users bigint, uses_freestyle bigint, uses_product_images bigint, last_used_at timestamp with time zone, first_used_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND gj.status = 'completed'
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
$function$;

CREATE OR REPLACE FUNCTION public.get_scene_unique_user_count(p_days integer DEFAULT 90)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT count(DISTINCT user_id)::int INTO v_count
  FROM (
    SELECT user_id FROM public.freestyle_generations
      WHERE scene_id IS NOT NULL
        AND created_at >= now() - (p_days || ' days')::interval
    UNION
    SELECT user_id FROM public.generation_jobs
      WHERE scene_id IS NOT NULL
        AND status = 'completed'
        AND created_at >= now() - (p_days || ' days')::interval
  ) u;

  RETURN COALESCE(v_count, 0);
END;
$function$;
