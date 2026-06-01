## Plan

Top up **wusiness.co@gmail.com** with **+100 credits**.

- User ID: `3bce9a52-433f-4682-9c1f-24fbf79a467b`
- Plan: free
- Current balance: **2** → **102**

### Action
Run via migration tool (needed to bypass `protect_billing_fields` trigger using `app.trusted_rpc`):

```sql
DO $$
BEGIN
  PERFORM set_config('app.trusted_rpc', 'true', true);
  UPDATE public.profiles
    SET credits_balance = credits_balance + 100,
        updated_at = now()
    WHERE user_id = '3bce9a52-433f-4682-9c1f-24fbf79a467b';
END $$;
```

No schema or code changes.