
CREATE OR REPLACE FUNCTION public.admin_generation_stats(p_hours integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_credits_spent bigint;
  v_cost_breakdown jsonb;
  v_total_est_cost numeric;
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

  -- Cost tracking: credits spent in timeframe
  SELECT COALESCE(sum(credits_reserved), 0)
  INTO v_credits_spent
  FROM generation_queue
  WHERE status = 'completed' AND created_at >= v_cutoff;

  -- Cost breakdown by job type with estimated costs
  SELECT COALESCE(jsonb_agg(row_to_json(b)::jsonb), '[]'::jsonb)
  INTO v_cost_breakdown
  FROM (
    SELECT
      job_type,
      count(*) as jobs,
      COALESCE(sum(credits_reserved), 0) as credits,
      round((COALESCE(sum(credits_reserved), 0) * CASE job_type
        WHEN 'upscale' THEN 0.01
        ELSE 0.02
      END)::numeric, 2) as est_cost
    FROM generation_queue
    WHERE status = 'completed' AND created_at >= v_cutoff
    GROUP BY job_type
    ORDER BY sum(credits_reserved) DESC
  ) b;

  -- Total estimated cost
  SELECT COALESCE(round(sum((b.est_cost)::numeric), 2), 0)
  INTO v_total_est_cost
  FROM jsonb_to_recordset(v_cost_breakdown) AS b(job_type text, jobs bigint, credits bigint, est_cost numeric);

  v_result := jsonb_build_object(
    'total', v_total,
    'completed', v_completed,
    'failed', v_failed,
    'cancelled', v_cancelled,
    'stuck', v_stuck,
    'avg_seconds', v_avg_seconds,
    'max_seconds', v_max_seconds,
    'recent_failures', v_recent_failures,
    'credits_spent', v_credits_spent,
    'cost_breakdown', v_cost_breakdown,
    'total_est_cost', v_total_est_cost
  );

  RETURN v_result;
END;
$function$;
