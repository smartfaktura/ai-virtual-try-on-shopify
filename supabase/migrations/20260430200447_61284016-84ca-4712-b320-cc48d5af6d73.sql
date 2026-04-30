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
    NEW.id, NEW.email, 20, v_display_name,
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