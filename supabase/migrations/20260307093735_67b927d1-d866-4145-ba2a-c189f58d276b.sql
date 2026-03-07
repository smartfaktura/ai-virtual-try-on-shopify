
-- Enable pg_net extension for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add last_low_credits_email_at to profiles for rate-limiting
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_low_credits_email_at timestamptz;

-- Trigger function: send welcome email on new profile creation
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  v_url := current_setting('app.settings.supabase_url', true);
  v_key := current_setting('app.settings.service_role_key', true);

  -- If settings not available, try from vault
  IF v_url IS NULL THEN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  END IF;
  IF v_key IS NULL THEN
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
  END IF;

  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM extensions.http_post(
      url := v_url || '/functions/v1/send-email',
      body := jsonb_build_object(
        'type', 'welcome',
        'to', NEW.email,
        'data', jsonb_build_object('displayName', COALESCE(NEW.display_name, split_part(NEW.email, '@', 1)))
      ),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'Content-Type', 'application/json'
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block profile creation if email fails
  RAISE WARNING 'notify_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS trg_notify_new_user ON public.profiles;
CREATE TRIGGER trg_notify_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();

-- Update deduct_credits to send low credits email
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  v_email TEXT;
  v_display_name TEXT;
  v_last_email TIMESTAMPTZ;
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

  -- Check if balance dropped below 10 and we haven't emailed in 24h
  IF new_balance < 10 AND new_balance >= 0 THEN
    SELECT email, display_name, last_low_credits_email_at
    INTO v_email, v_display_name, v_last_email
    FROM profiles WHERE user_id = p_user_id;

    IF v_last_email IS NULL OR v_last_email < now() - interval '24 hours' THEN
      -- Update timestamp
      UPDATE profiles SET last_low_credits_email_at = now() WHERE user_id = p_user_id;

      -- Send email via edge function
      v_url := current_setting('app.settings.supabase_url', true);
      v_key := current_setting('app.settings.service_role_key', true);
      IF v_url IS NULL THEN
        SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
      END IF;
      IF v_key IS NULL THEN
        SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
      END IF;

      IF v_url IS NOT NULL AND v_key IS NOT NULL AND v_email IS NOT NULL THEN
        BEGIN
          PERFORM extensions.http_post(
            url := v_url || '/functions/v1/send-email',
            body := jsonb_build_object(
              'type', 'low_credits',
              'to', v_email,
              'data', jsonb_build_object('balance', new_balance, 'displayName', v_display_name)
            ),
            headers := jsonb_build_object(
              'Authorization', 'Bearer ' || v_key,
              'Content-Type', 'application/json'
            )
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'low_credits email failed: %', SQLERRM;
        END;
      END IF;
    END IF;
  END IF;

  RETURN new_balance;
END;
$$;
