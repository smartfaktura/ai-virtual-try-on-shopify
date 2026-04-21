ALTER TABLE public.profiles DISABLE TRIGGER USER;
UPDATE public.profiles SET credits_balance = credits_balance + 10000, updated_at = now() WHERE email = 'info@tsimkus.lt';
ALTER TABLE public.profiles ENABLE TRIGGER USER;