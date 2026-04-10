
# Add 10,000 Credits to info@tsimkus.lt

## Current State
- User: info@tsimkus.lt (user_id: `fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc`)
- Current balance: **92 credits**
- Plan: **pro**

## What Needs to Happen
A database migration that adds 10,000 credits to this user's balance. The `protect_billing_fields` trigger requires service_role privileges, which migrations run with.

## Migration SQL
```sql
UPDATE profiles 
SET credits_balance = credits_balance + 10000 
WHERE user_id = 'fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';
```

New balance will be: **10,092 credits**

## File Changed
| File | Change |
|------|--------|
| `supabase/migrations/` (new) | Single UPDATE to add 10,000 credits |
