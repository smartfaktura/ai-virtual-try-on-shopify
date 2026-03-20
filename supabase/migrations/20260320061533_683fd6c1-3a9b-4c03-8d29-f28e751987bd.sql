
CREATE OR REPLACE FUNCTION public.notify_contact_submission()
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
        'type', 'contact_form',
        'to', 'hello@vovv.ai',
        'data', jsonb_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'message', NEW.message,
          'inquiryType', NEW.inquiry_type
        )
      ),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'Content-Type', 'application/json'
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_contact_submission failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contact_submission_insert
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_contact_submission();
