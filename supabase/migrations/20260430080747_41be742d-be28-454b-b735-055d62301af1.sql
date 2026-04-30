-- One-time hard delete of stuck signup tsimkus@icloud.com so they can re-register
DELETE FROM public.suppressed_emails WHERE email = 'tsimkus@icloud.com';
DELETE FROM public.marketing_unsubscribes WHERE email = 'tsimkus@icloud.com';
DELETE FROM public.email_unsubscribe_tokens WHERE email = 'tsimkus@icloud.com';
DELETE FROM public.profiles WHERE user_id = '53bc615f-714d-4ad8-8c67-32b3bbd36f90';
DELETE FROM auth.users WHERE id = '53bc615f-714d-4ad8-8c67-32b3bbd36f90';