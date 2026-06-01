## Plan

Top up the account **tatianaloof@me.com** with **+60 credits**.

- User ID: `4dd2eeee-d08d-4894-a1f6-414a77a3b5f1`
- Plan: free
- Current balance: **2**
- New balance: **62**

### Action
Run a single UPDATE against `public.profiles` via the data tool:

```sql
UPDATE public.profiles
SET credits_balance = credits_balance + 60
WHERE user_id = '4dd2eeee-d08d-4894-a1f6-414a77a3b5f1';
```

No schema changes, no code changes.