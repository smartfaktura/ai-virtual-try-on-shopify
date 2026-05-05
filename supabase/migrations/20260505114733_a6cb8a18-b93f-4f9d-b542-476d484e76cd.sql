
CREATE OR REPLACE FUNCTION public.enqueue_generation(p_user_id uuid, p_job_type text, p_payload jsonb, p_credits_cost integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan TEXT;
  v_balance INTEGER;
  v_is_first BOOLEAN;
  v_priority INTEGER;
  v_job_id UUID;
  v_position BIGINT;
  v_burst_count INTEGER;
  v_burst_limit INTEGER;
  v_email TEXT;
BEGIN
  SELECT plan, credits_balance, email INTO v_plan, v_balance, v_email
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_plan IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  IF v_balance < p_credits_cost THEN
    RETURN jsonb_build_object('error', 'Insufficient credits', 'balance', v_balance);
  END IF;

  v_burst_limit := CASE v_plan
    WHEN 'enterprise' THEN 300
    WHEN 'pro' THEN 200
    WHEN 'growth' THEN 80
    WHEN 'starter' THEN 40
    ELSE 15
  END;

  SELECT count(*) INTO v_burst_count
  FROM generation_queue
  WHERE user_id = p_user_id
    AND created_at > now() - interval '60 seconds'
    AND status IN ('queued', 'processing', 'completed', 'failed');

  IF v_burst_count >= v_burst_limit THEN
    RETURN jsonb_build_object(
      'error', 'Too many requests. Please wait a moment before generating again.',
      'burst_limit', v_burst_limit,
      'retry_after_seconds', 5
    );
  END IF;

  SELECT NOT EXISTS(
    SELECT 1 FROM generation_jobs WHERE user_id = p_user_id LIMIT 1
  ) INTO v_is_first;

  v_priority := CASE v_plan
    WHEN 'enterprise' THEN 5
    WHEN 'pro' THEN 10
    WHEN 'growth' THEN 20
    WHEN 'starter' THEN 30
    ELSE 50
  END;
  IF v_is_first THEN v_priority := v_priority - 20; END IF;

  UPDATE profiles SET credits_balance = credits_balance - p_credits_cost
  WHERE user_id = p_user_id;

  INSERT INTO generation_queue (user_id, job_type, priority_score, payload,
    credits_reserved, user_plan, is_first_generation)
  VALUES (p_user_id, p_job_type, v_priority, p_payload,
    p_credits_cost, v_plan, v_is_first)
  RETURNING id INTO v_job_id;

  SELECT count(*) INTO v_position
  FROM generation_queue
  WHERE status = 'queued' AND id != v_job_id
    AND (priority_score < v_priority
      OR (priority_score = v_priority
          AND created_at < (SELECT created_at FROM generation_queue WHERE id = v_job_id)));

  -- Fire first-generation event to Resend
  IF v_is_first AND v_email IS NOT NULL THEN
    PERFORM public._invoke_edge_function(
      'track-resend-event',
      jsonb_build_object(
        'email', v_email,
        'user_id', p_user_id,
        'event', 'user.first_generation'
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'job_id', v_job_id,
    'position', v_position,
    'priority', v_priority,
    'new_balance', v_balance - p_credits_cost
  );
END;
$function$;
