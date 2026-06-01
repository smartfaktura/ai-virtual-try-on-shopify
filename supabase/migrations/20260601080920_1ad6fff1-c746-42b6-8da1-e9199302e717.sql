DO $$
BEGIN
  PERFORM set_config('app.trusted_rpc', 'true', true);
  UPDATE public.profiles
    SET credits_balance = credits_balance + 100,
        updated_at = now()
    WHERE user_id = '3bce9a52-433f-4682-9c1f-24fbf79a467b';
END $$;