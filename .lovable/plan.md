

## Change New User Signup Credits to 60

Single database migration to update the `handle_new_user()` function, changing the initial `credits_balance` from `20` to `60`.

### Change

Update the `handle_new_user()` function so the INSERT sets `credits_balance` to `60` instead of `20`. No frontend or UI changes needed — the balance is read dynamically from the database.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, credits_balance, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    60,
    COALESCE(...)
  );
  RETURN NEW;
END;
$$;
```

Existing users are unaffected — only new signups get 60 credits.

