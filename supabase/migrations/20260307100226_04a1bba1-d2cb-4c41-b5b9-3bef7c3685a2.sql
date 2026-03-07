
-- Fix notify_new_user: extensions.http_post → net.http_post
CREATE OR REPLACE FUNCTION public.notify_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM net.http_post(
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
  RAISE WARNING 'notify_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Fix deduct_credits: extensions.http_post → net.http_post
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
            PERFORM net.http_post(
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
  END IF;

  RETURN new_balance;
END;
$function$;
