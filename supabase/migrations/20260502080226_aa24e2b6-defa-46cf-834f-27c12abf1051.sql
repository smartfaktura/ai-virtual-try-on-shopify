-- Temporarily disable the billing protection trigger
ALTER TABLE profiles DISABLE TRIGGER USER;

UPDATE profiles
SET plan = 'growth',
    credits_balance = 1500,
    updated_at = now()
WHERE user_id = 'f5ef27b2-c1bd-47dc-a25f-b59cddef9195';

-- Re-enable user triggers
ALTER TABLE profiles ENABLE TRIGGER USER;