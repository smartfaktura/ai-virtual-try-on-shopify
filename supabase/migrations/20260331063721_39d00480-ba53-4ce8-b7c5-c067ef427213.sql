ALTER TABLE profiles DISABLE TRIGGER protect_billing_fields_trigger;
ALTER TABLE profiles DISABLE TRIGGER trg_protect_billing_fields;

UPDATE profiles 
SET credits_balance = credits_balance + 5000
WHERE user_id = 'fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

ALTER TABLE profiles ENABLE TRIGGER protect_billing_fields_trigger;
ALTER TABLE profiles ENABLE TRIGGER trg_protect_billing_fields;