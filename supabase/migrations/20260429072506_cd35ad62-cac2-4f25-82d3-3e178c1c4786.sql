
-- 1. Drop unused campaign/automation tables
DROP TABLE IF EXISTS public.email_campaign_recipients CASCADE;
DROP TABLE IF EXISTS public.email_campaigns CASCADE;
DROP TABLE IF EXISTS public.email_automation_queue CASCADE;
DROP TABLE IF EXISTS public.email_automation_log CASCADE;
DROP TABLE IF EXISTS public.email_automations CASCADE;
DROP FUNCTION IF EXISTS public.resolve_email_audience(jsonb) CASCADE;

-- 2. Resend event log
CREATE TABLE IF NOT EXISTS public.resend_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resend_event_log_created_idx ON public.resend_event_log (created_at DESC);
CREATE INDEX IF NOT EXISTS resend_event_log_email_idx ON public.resend_event_log (email);

ALTER TABLE public.resend_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read resend events"
  ON public.resend_event_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages resend events"
  ON public.resend_event_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Helper to call edge functions from triggers/RPCs (uses pg_net)
CREATE OR REPLACE FUNCTION public._invoke_edge_function(p_function text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  v_key := current_setting('app.settings.service_role_key', true);

  IF v_url IS NULL THEN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  END IF;
  IF v_key IS NULL THEN
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
  END IF;

  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE WARNING '_invoke_edge_function: missing url/key';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := v_url || '/functions/v1/' || p_function,
    body := p_payload,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '_invoke_edge_function failed: %', SQLERRM;
END;
$$;

-- 4. Update handle_new_user → also push contact to Resend
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (user_id, email, credits_balance, display_name, settings)
  VALUES (
    NEW.id, NEW.email, 60, v_display_name,
    '{"emailOnFailed": false, "inAppFailed": false}'::jsonb
  );

  -- Forward signup event to Resend (sync contact + tag)
  PERFORM public._invoke_edge_function(
    'sync-resend-contact',
    jsonb_build_object(
      'email', NEW.email,
      'user_id', NEW.id,
      'display_name', v_display_name,
      'event', 'user.signup'
    )
  );

  RETURN NEW;
END;
$$;

-- 5. Update enqueue_generation → fire first_generation event
CREATE OR REPLACE FUNCTION public.enqueue_generation(p_user_id uuid, p_job_type text, p_payload jsonb, p_credits_cost integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    WHEN 'enterprise' THEN 200
    WHEN 'pro' THEN 120
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
$$;

-- 6. Update deduct_credits → also tag user in Resend when low
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  v_email TEXT;
  v_display_name TEXT;
  v_last_email TIMESTAMPTZ;
  v_settings JSONB;
  v_url TEXT;
  v_key TEXT;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', current_balance, p_amount;
  END IF;

  new_balance := current_balance - p_amount;

  UPDATE profiles SET credits_balance = new_balance
  WHERE user_id = p_user_id;

  IF new_balance < 10 AND new_balance >= 0 THEN
    SELECT email, display_name, last_low_credits_email_at, COALESCE(settings, '{}'::jsonb)
    INTO v_email, v_display_name, v_last_email, v_settings
    FROM profiles WHERE user_id = p_user_id;

    IF (v_settings->>'emailLowCredits') IS DISTINCT FROM 'false' THEN
      IF v_last_email IS NULL OR v_last_email < now() - interval '24 hours' THEN
        UPDATE profiles SET last_low_credits_email_at = now() WHERE user_id = p_user_id;

        -- Fire event to Resend (their automation can send the email)
        IF v_email IS NOT NULL THEN
          PERFORM public._invoke_edge_function(
            'track-resend-event',
            jsonb_build_object(
              'email', v_email,
              'user_id', p_user_id,
              'event', 'credits.low',
              'attributes', jsonb_build_object('balance', new_balance)
            )
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN new_balance;
END;
$$;
