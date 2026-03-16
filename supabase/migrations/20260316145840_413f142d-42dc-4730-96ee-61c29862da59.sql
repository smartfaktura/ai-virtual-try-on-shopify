
CREATE OR REPLACE FUNCTION public.admin_generation_stats(p_hours integer)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result jsonb;
  v_cutoff timestamptz;
  v_total bigint;
  v_completed bigint;
  v_failed bigint;
  v_cancelled bigint;
  v_stuck bigint;
  v_avg_seconds numeric;
  v_max_seconds numeric;
  v_recent_failures jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_cutoff := now() - (p_hours || ' hours')::interval;

  SELECT
    count(*),
    count(*) FILTER (WHERE status = 'completed'),
    count(*) FILTER (WHERE status = 'failed'),
    count(*) FILTER (WHERE status = 'cancelled')
  INTO v_total, v_completed, v_failed, v_cancelled
  FROM generation_queue
  WHERE created_at >= v_cutoff;

  SELECT count(*) INTO v_stuck
  FROM generation_queue
  WHERE status = 'processing'
    AND started_at < now() - interval '5 minutes';

  SELECT
    COALESCE(round(avg(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 1), 0),
    COALESCE(round(max(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 1), 0)
  INTO v_avg_seconds, v_max_seconds
  FROM generation_queue
  WHERE status = 'completed'
    AND completed_at IS NOT NULL
    AND started_at IS NOT NULL
    AND created_at >= v_cutoff;

  SELECT COALESCE(jsonb_agg(row_to_json(f)::jsonb ORDER BY f.created_at DESC), '[]'::jsonb)
  INTO v_recent_failures
  FROM (
    SELECT id, job_type, error_message, created_at, user_plan
    FROM generation_queue
    WHERE status = 'failed' AND created_at >= v_cutoff
    ORDER BY created_at DESC
    LIMIT 20
  ) f;

  v_result := jsonb_build_object(
    'total', v_total,
    'completed', v_completed,
    'failed', v_failed,
    'cancelled', v_cancelled,
    'stuck', v_stuck,
    'avg_seconds', v_avg_seconds,
    'max_seconds', v_max_seconds,
    'recent_failures', v_recent_failures
  );

  RETURN v_result;
END;
$$;
