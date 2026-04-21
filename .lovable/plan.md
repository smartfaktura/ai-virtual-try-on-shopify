

## Add 10,000 credits to info@tsimkus.lt

### What I'll do
Run a single SQL update against `profiles` to add 10,000 credits to the account with email `info@tsimkus.lt`.

```sql
UPDATE profiles
SET credits_balance = credits_balance + 10000,
    updated_at = now()
WHERE email = 'info@tsimkus.lt'
RETURNING user_id, email, credits_balance;
```

### Notes
- The `protect_billing_fields` trigger blocks direct `credits_balance` changes for non-service roles, but the migration runner executes as service role, so this update will pass.
- After running, I'll confirm the new balance from the `RETURNING` row.
- No code changes, no schema changes.

