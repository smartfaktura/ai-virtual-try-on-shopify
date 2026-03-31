CREATE OR REPLACE FUNCTION public.claim_next_job()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job
  FROM generation_queue
  WHERE status = 'queued'
  ORDER BY priority_score ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('job', null);
  END IF;

  UPDATE generation_queue
  SET status = 'processing',
      started_at = now(),
      timeout_at = now() + interval '5 minutes'
  WHERE id = v_job.id;

  RETURN jsonb_build_object('job', row_to_json(v_job));
END;
$function$;