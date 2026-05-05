ALTER TABLE profiles DISABLE TRIGGER protect_billing_fields_trigger;
ALTER TABLE profiles DISABLE TRIGGER trg_protect_billing_fields;

UPDATE profiles
SET credits_balance = credits_balance + 10000
WHERE email = 'info@tsimkus.lt';

ALTER TABLE profiles ENABLE TRIGGER protect_billing_fields_trigger;
ALTER TABLE profiles ENABLE TRIGGER trg_protect_billing_fields;