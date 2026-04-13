SET LOCAL role = 'service_role';

UPDATE profiles
SET credits_balance = credits_balance + 10000,
    updated_at = now()
WHERE user_id = 'fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

RESET role;