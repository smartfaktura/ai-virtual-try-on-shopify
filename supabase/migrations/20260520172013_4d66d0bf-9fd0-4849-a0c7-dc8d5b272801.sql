SET LOCAL app.trusted_rpc = 'true';
UPDATE public.profiles
SET credits_balance = credits_balance + 300,
    updated_at = now()
WHERE email = 'info@skillluckgo.com';