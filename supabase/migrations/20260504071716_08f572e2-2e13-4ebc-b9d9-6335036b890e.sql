SET LOCAL ROLE service_role;
UPDATE profiles SET credits_balance = credits_balance + 12 WHERE email = 'info@tsimkus.lt';
RESET ROLE;