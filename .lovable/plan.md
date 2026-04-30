## Goal
New users currently receive **60 credits** on signup. Change this to **20 credits** so the database matches the Free plan allotment already shown in the UI (`CreditContext` defines `free.monthlyCredits = 20`).

## Where the value lives
The `handle_new_user()` trigger function (runs on `auth.users` insert) inserts the initial profile with a hardcoded `60`:

```
supabase/migrations/20260429072506_*.sql, line 94
INSERT INTO public.profiles (..., credits_balance, ...) VALUES (NEW.id, NEW.email, 60, ...);
```

The frontend (`src/contexts/CreditContext.tsx`) already treats Free = 20, so no UI change is needed.

## Change
Create a new migration that does `CREATE OR REPLACE FUNCTION public.handle_new_user()` with the same body but `credits_balance = 20`. All other logic (display name resolution, Resend sync) stays identical.

## Scope
- Affects only **future signups**. Existing users keep their current balances.
- No frontend changes.
- No effect on paid plan grants (those flow through `change_user_plan` in `check-subscription`).

## Verification after deploy
- New test signup → `profiles.credits_balance` = 20.
- Sidebar `CreditIndicator` shows `20 / 20`.
