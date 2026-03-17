

## Fix: `current_period_end` Reading From Wrong Location

### Root Cause
The Stripe `2025-08-27.basil` API version moved `current_period_end` from the top-level subscription object to the subscription **item** (`items.data[0]`). Our code reads `activeSub.current_period_end` which is `undefined`.

Actual data location:
```text
subscription.current_period_end         → undefined
subscription.items.data[0].current_period_end → 1776430763
```

### Fix in `supabase/functions/check-subscription/index.ts`

Change the period end extraction to read from the subscription item, with a fallback to the top-level field for backward compatibility:

```typescript
// Before (broken):
periodEnd = safeISODate(activeSub.current_period_end);

// After (fixed):
const rawPeriodEnd = activeSub.items?.data?.[0]?.current_period_end ?? activeSub.current_period_end;
periodEnd = safeISODate(rawPeriodEnd);
```

### Result
- `current_period_end` will correctly resolve to `2026-04-15` for this user
- The Settings page will be able to display when the subscription ends
- When the period lapses, the system will correctly detect no active subscription and downgrade to free

### File
- `supabase/functions/check-subscription/index.ts` (single line change)

