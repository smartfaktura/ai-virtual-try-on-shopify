# Add 300 credits to info@skillluckgo.com

Current balance: **64 credits** (plan: starter)
New balance after top-up: **364 credits**

## Change

Run a one-off migration that updates the `profiles` row for `info@skillluckgo.com`:

```sql
UPDATE public.profiles
SET credits_balance = credits_balance + 300,
    updated_at = now()
WHERE email = 'info@skillluckgo.com';
```

No code changes, no schema changes. Just a manual credit grant.
