-- Add feature_email_sent_at column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS feature_email_sent_at timestamptz;

-- Enable pg_cron and pg_net if not already
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the function to send feature highlight emails
CREATE OR REPLACE FUNCTION public.send_feature_highlight_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_url TEXT;
  v_key TEXT;
  v_has_jobs BOOLEAN;
BEGIN
  -- Get Supabase URL and service role key
  v_url := current_setting('app.settings.supabase_url', true);
  v_key := current_setting('app.settings.service_role_key', true);
  IF v_url IS NULL THEN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  END IF;
  IF v_key IS NULL THEN
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
  END IF;

  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE WARNING 'send_feature_highlight_emails: missing URL or key';
    RETURN;
  END IF;

  FOR v_row IN
    SELECT p.user_id, p.email, p.display_name, p.credits_balance
    FROM profiles p
    WHERE p.plan = 'free'
      AND p.created_at < now() - interval '24 hours'
      AND p.feature_email_sent_at IS NULL
      AND p.marketing_emails_opted_in = true
    ORDER BY p.created_at ASC
    LIMIT 50
  LOOP
    -- Check if user has ever generated anything
    SELECT EXISTS(
      SELECT 1 FROM generation_jobs WHERE user_id = v_row.user_id LIMIT 1
    ) INTO v_has_jobs;

    -- Skip: 0-3 credits AND never generated = never engaged
    IF v_row.credits_balance < 4 AND NOT v_has_jobs THEN
      CONTINUE;
    END IF;

    -- Send the email
    BEGIN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-email',
        body := jsonb_build_object(
          'type', 'features_highlight',
          'to', v_row.email,
          'data', jsonb_build_object(
            'displayName', COALESCE(v_row.display_name, split_part(v_row.email, '@', 1)),
            'creditsBalance', v_row.credits_balance,
            'hasGenerated', v_has_jobs
          )
        ),
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || v_key,
          'Content-Type', 'application/json'
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'feature_highlight email failed for %: %', v_row.user_id, SQLERRM;
    END;

    -- Mark as sent
    UPDATE profiles SET feature_email_sent_at = now() WHERE user_id = v_row.user_id;
  END LOOP;
END;
$$;