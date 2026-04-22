CREATE OR REPLACE FUNCTION public.get_scene_unique_user_count(p_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
        AND created_at >= now() - (p_days || ' days')::interval
  ) u;

  RETURN COALESCE(v_count, 0);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_scene_unique_user_count(integer) TO authenticated;