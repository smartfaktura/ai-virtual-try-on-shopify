## Upgrade User to Growth Plan

**User**: zahiddiu4@gmail.com  
**Current**: Free plan, 0 credits  
**Target**: Growth plan, 1500 credits  

### Action
Run the existing `change_user_plan` RPC (SECURITY DEFINER) via a direct SQL call to set the user's plan to `growth` and credits to 1500.

```sql
SELECT change_user_plan(
  'f5ef27b2-c1bd-47dc-a25f-b59cddef9195'::uuid,
  'growth',
  1500
);
```

This is a one-time manual override — no code changes needed.