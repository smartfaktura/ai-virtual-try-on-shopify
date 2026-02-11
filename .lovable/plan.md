

## Phase 1 Final Fix: Make CreditContext Local-State-Only

### Problem

`deductCredits` and `addCredits` in `CreditContext.tsx` still directly write to the database via the Supabase client. Since credits are now managed server-side through `deduct_credits` and `refund_credits` SQL functions (called by edge functions), these client-side DB writes create race conditions and bypass the atomic server-side logic.

### Fix

Change both functions to only update local React state -- no database calls. The server is the source of truth; these functions exist solely for optimistic UI updates.

**File: `src/contexts/CreditContext.tsx`**

Replace `deductCredits` (lines 106-116):
```typescript
const deductCredits = useCallback((amount: number) => {
  setBalance(prev => Math.max(0, prev - amount));
}, []);
```

Replace `addCredits` (lines 118-128):
```typescript
const addCredits = useCallback((amount: number) => {
  setBalance(prev => prev + amount);
}, []);
```

Key changes:
- Remove `async` -- no longer awaiting anything
- Remove all `supabase.from('profiles').update(...)` calls
- Use functional state updates (`prev =>`) to avoid stale closure issues
- Remove `balance` and `user` from dependency arrays since they're no longer needed

No other files need changes. This completes Phase 1.
