

# Add 10,000 Credits to info@tsimkus.lt

## Current State
- **Email:** info@tsimkus.lt
- **Plan:** Pro
- **Current balance:** 12 credits

## Action
Run a database migration calling the existing `add_purchased_credits` function:

```sql
SELECT add_purchased_credits('fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc', 10000);
```

This will set the new balance to **10,012 credits**.

