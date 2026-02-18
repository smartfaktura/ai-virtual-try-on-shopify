

## Fix: Handle Expired Auth Sessions Gracefully

### Problem
The user's authentication session has expired, but the app still tries to call backend functions (`check-subscription`, `create-checkout`) with the stale token. This causes repeated "Auth session missing!" errors.

### Solution

**1. Update `src/contexts/CreditContext.tsx`**
- Before calling `check-subscription` or `create-checkout`, retrieve the current session from the auth client
- If no valid session exists, skip the call silently (for check-subscription) or show a "please log in" message (for checkout)
- Pass the fresh access token explicitly if needed

Changes:
- In `checkSubscription`: call `supabase.auth.getSession()` first; if no session, return early without error
- In `startCheckout`: call `supabase.auth.getSession()` first; if no session, show toast asking user to log in
- Clear the polling interval if the session becomes invalid

**2. No edge function changes needed**
Both `create-checkout` and `check-subscription` already use `SUPABASE_SERVICE_ROLE_KEY` with `persistSession: false` -- this is correct. The problem is purely that an expired token is being sent.

### Technical Details

In `CreditContext.tsx`, the `checkSubscription` callback will be updated to:
```text
const checkSubscription = useCallback(async () => {
  if (!user) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // Session expired, skip silently
  // ... existing invoke call
}, [user]);
```

Similarly for `startCheckout`:
```text
const startCheckout = useCallback(async (priceId, mode) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error('Please log in to continue.');
    return;
  }
  // ... existing invoke call
}, []);
```

This ensures no backend calls are made with expired tokens, eliminating the 500 errors.

