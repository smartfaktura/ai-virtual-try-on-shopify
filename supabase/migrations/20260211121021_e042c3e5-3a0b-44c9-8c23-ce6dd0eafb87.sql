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
  v_concurrent INTEGER;
  v_max_concurrent INTEGER;
  v_job_id UUID;
  v_position BIGINT;
BEGIN
  SELECT plan, credits_balance INTO v_plan, v_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_plan IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  IF v_balance < p_credits_cost THEN
    RETURN jsonb_build_object('error', 'Insufficient credits', 'balance', v_balance);
  END IF;

  SELECT count(*) INTO v_concurrent
  FROM generation_queue
  WHERE user_id = p_user_id AND status = 'processing';

  v_max_concurrent := CASE v_plan
    WHEN 'enterprise' THEN 6
    WHEN 'pro' THEN 4
    WHEN 'growth' THEN 3
    WHEN 'starter' THEN 2
    ELSE 1
  END;

  IF v_concurrent >= v_max_concurrent THEN
    RETURN jsonb_build_object(
      'error', 'Too many concurrent generations',
      'max_concurrent', v_max_concurrent
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

  RETURN jsonb_build_object(
    'job_id', v_job_id,
    'position', v_position,
    'priority', v_priority,
    'new_balance', v_balance - p_credits_cost
  );
END;
$function$;