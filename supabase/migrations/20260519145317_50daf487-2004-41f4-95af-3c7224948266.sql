DO $$
BEGIN
  PERFORM set_config('app.trusted_rpc', 'true', true);
  UPDATE public.profiles
  SET credits_balance = 6000
  WHERE user_id = '6d565be0-397a-4910-bbb1-050796441040'
    AND plan = 'starter'
    AND billing_interval = 'annual'
    AND credits_balance < 6000;
  PERFORM set_config('app.trusted_rpc', '', true);
END $$;