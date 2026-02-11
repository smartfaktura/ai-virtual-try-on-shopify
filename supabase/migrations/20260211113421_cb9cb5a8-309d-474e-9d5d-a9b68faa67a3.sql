
-- Phase 2: Generation Queue table and functions

CREATE TABLE public.generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  priority_score INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL,
  result JSONB,
  credits_reserved INTEGER NOT NULL DEFAULT 0,
  user_plan TEXT NOT NULL DEFAULT 'free',
  is_first_generation BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_queue_status_priority ON generation_queue(status, priority_score, created_at)
  WHERE status = 'queued';
CREATE INDEX idx_queue_user_processing ON generation_queue(user_id)
  WHERE status = 'processing';
CREATE INDEX idx_queue_user_recent ON generation_queue(user_id, created_at DESC);

-- RLS
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue jobs"
  ON generation_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Users can cancel their own queued jobs
CREATE POLICY "Users can cancel their own queued jobs"
  ON generation_queue FOR UPDATE
  USING (auth.uid() = user_id AND status = 'queued');

-- Enqueue generation function (atomic credit check + deduction + insert)
CREATE OR REPLACE FUNCTION public.enqueue_generation(
  p_user_id UUID,
  p_job_type TEXT,
  p_payload JSONB,
  p_credits_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  -- Get user plan and balance (locked row)
  SELECT plan, credits_balance INTO v_plan, v_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_plan IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  IF v_balance < p_credits_cost THEN
    RETURN jsonb_build_object('error', 'Insufficient credits', 'balance', v_balance);
  END IF;

  -- Check concurrent jobs
  SELECT count(*) INTO v_concurrent
  FROM generation_queue
  WHERE user_id = p_user_id AND status = 'processing';

  v_max_concurrent := CASE v_plan
    WHEN 'pro' THEN 4 WHEN 'growth' THEN 3
    WHEN 'starter' THEN 2 ELSE 1
  END;

  -- Check if first-ever generation
  SELECT NOT EXISTS(
    SELECT 1 FROM generation_jobs WHERE user_id = p_user_id LIMIT 1
  ) INTO v_is_first;

  -- Calculate priority (lower = higher priority)
  v_priority := CASE v_plan
    WHEN 'enterprise' THEN 5
    WHEN 'pro' THEN 10
    WHEN 'growth' THEN 20
    WHEN 'starter' THEN 30
    ELSE 50
  END;
  IF v_is_first THEN v_priority := v_priority - 20; END IF;
  IF p_job_type = 'video' THEN v_priority := v_priority + 10; END IF;

  -- Deduct credits atomically
  UPDATE profiles SET credits_balance = credits_balance - p_credits_cost
  WHERE user_id = p_user_id;

  -- Insert job
  INSERT INTO generation_queue (user_id, job_type, priority_score, payload,
    credits_reserved, user_plan, is_first_generation)
  VALUES (p_user_id, p_job_type, v_priority, p_payload,
    p_credits_cost, v_plan, v_is_first)
  RETURNING id INTO v_job_id;

  -- Calculate queue position
  SELECT count(*) INTO v_position
  FROM generation_queue
  WHERE status = 'queued' AND id != v_job_id
    AND (priority_score < v_priority
      OR (priority_score = v_priority AND created_at < now()));

  RETURN jsonb_build_object(
    'job_id', v_job_id,
    'position', v_position,
    'priority', v_priority,
    'new_balance', v_balance - p_credits_cost
  );
END;
$$;

-- Claim next job for processing (atomic with SKIP LOCKED)
CREATE OR REPLACE FUNCTION public.claim_next_job()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Cleanup timed-out jobs and refund credits
CREATE OR REPLACE FUNCTION public.cleanup_stale_jobs()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stale RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_stale IN
    UPDATE generation_queue
    SET status = 'failed', error_message = 'Timed out after 5 minutes', completed_at = now()
    WHERE status = 'processing' AND timeout_at < now()
    RETURNING user_id, credits_reserved
  LOOP
    UPDATE profiles SET credits_balance = credits_balance + v_stale.credits_reserved
    WHERE user_id = v_stale.user_id;
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('cleaned', v_count);
END;
$$;
