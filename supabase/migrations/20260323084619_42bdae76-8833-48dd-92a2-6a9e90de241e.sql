CREATE OR REPLACE FUNCTION public.admin_platform_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'active_generators', (
      SELECT count(DISTINCT user_id) FROM generation_queue WHERE status = 'completed'
    ),
    'total_freestyle', (SELECT count(*) FROM freestyle_generations),
    'total_images', (
      (SELECT count(*) FROM freestyle_generations) +
      (SELECT COALESCE(sum(jsonb_array_length(COALESCE(results, '[]'::jsonb))), 0) FROM generation_jobs WHERE status = 'completed')
    ),
    'total_videos', (SELECT count(*) FROM generated_videos),
    'total_products', (SELECT count(*) FROM user_products),
    'total_credits_spent', (
      SELECT COALESCE(sum(credits_reserved), 0) FROM generation_queue WHERE status = 'completed'
    ),
    'total_brand_profiles', (SELECT count(*) FROM brand_profiles),
    'total_drops', (SELECT count(*) FROM creative_drops),
    'jobs_by_type', (
      SELECT COALESCE(jsonb_object_agg(job_type, cnt), '{}'::jsonb)
      FROM (
        SELECT job_type, count(*) as cnt
        FROM generation_queue
        GROUP BY job_type
      ) t
    ),
    'workflows_breakdown', (
      SELECT COALESCE(jsonb_agg(row_to_json(w)), '[]'::jsonb)
      FROM (
        SELECT
          COALESCE(payload->>'workflow_name', 'Freestyle (direct)') as name,
          count(*) as total,
          count(*) FILTER (WHERE status = 'completed') as completed
        FROM generation_queue
        GROUP BY payload->>'workflow_name'
        ORDER BY count(*) DESC
      ) w
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;