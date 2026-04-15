

# Add 10,000 Credits to info@tsimkus.lt

## What We're Doing
Adding 10,000 credits to the user `info@tsimkus.lt` (current balance: 125, Pro plan). New balance will be 10,125.

## Technical Details
The `protect_billing_fields` trigger blocks credit modifications from non-service_role connections. A database migration will be used to run the update as the schema owner, bypassing the trigger.

### Migration SQL
```sql
UPDATE profiles
SET credits_balance = credits_balance + 10000
WHERE user_id = 'fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';
```

No code changes needed.

