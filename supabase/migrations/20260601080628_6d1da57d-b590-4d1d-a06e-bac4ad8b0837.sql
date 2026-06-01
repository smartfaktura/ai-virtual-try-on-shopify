DO $$
BEGIN
  PERFORM set_config('app.trusted_rpc', 'true', true);
  UPDATE public.profiles
    SET credits_balance = credits_balance + 60,
        updated_at = now()
    WHERE user_id = '4dd2eeee-d08d-4894-a1f6-414a77a3b5f1';
END $$;