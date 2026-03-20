

# Add 10 Credits to info@tsimkus.lt

## Current State
- Email: info@tsimkus.lt
- User ID: `fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc`
- Current balance: **2 credits**
- Target balance: **12 credits**

## Action

Run a single SQL migration:

```sql
SELECT add_purchased_credits('fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc'::uuid, 10);
```

This uses the existing `add_purchased_credits` database function which safely adds credits and returns the new balance. No code changes needed.

