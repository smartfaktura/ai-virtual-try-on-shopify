## Add 500 credits to anastasija@createurmedia.lt

Use the existing `add_purchased_credits` RPC (SECURITY DEFINER, bypasses billing trigger, fires Resend `credits.purchased` event) to atomically grant credits to the user.

### Step
Look up the user's `user_id` from `profiles` by email, then call the RPC:

```sql
SELECT public.add_purchased_credits(
  (SELECT user_id FROM public.profiles WHERE email = 'anastasija@createurmedia.lt'),
  500
);
```

### Notes
- No schema change. Single data-only call via the insert tool.
- If the email doesn't match any profile, the RPC raises `User not found` and nothing changes.
