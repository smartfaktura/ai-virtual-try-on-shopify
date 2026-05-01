## Problem

The password recovery flow has a race condition that prevents the "Set new password" form from appearing. When a user clicks the recovery link:

1. Supabase client in `AuthProvider` processes the URL hash fragment (`#access_token=...&type=recovery`) via `getSession()` and fires the `PASSWORD_RECOVERY` event
2. The `ResetPassword` component mounts and subscribes to `onAuthStateChange` — but the event has already fired and been consumed
3. The hash fragment has already been stripped from the URL, so `window.location.hash.includes('type=recovery')` also fails
4. The user is stuck on "Verifying recovery link..." with no form

## Fix (single file: `src/pages/ResetPassword.tsx`)

**Replace the detection logic** with a more robust approach:

1. **Check for an active session immediately** — if the user arrived via a recovery link, Supabase will have already established a session. Call `supabase.auth.getSession()` on mount and check if there's an active session. Combined with the URL origin (`/reset-password`), this is sufficient to show the form.

2. **Keep the `PASSWORD_RECOVERY` event listener** as a secondary trigger (for cases where the session hasn't been processed yet on mount).

3. **Add a `sessionStorage` flag set by `AuthProvider`** — update `AuthProvider` to set `sessionStorage.setItem('password_recovery', '1')` when it detects the `PASSWORD_RECOVERY` event, so `ResetPassword` can read it even if the event already fired.

4. **Prevent `AuthProvider` from auto-navigating** during recovery — the `Auth.tsx` page has `if (!isLoading && user) navigate('/app')`, but since `/reset-password` is a separate route this isn't the issue. However, if a user is already logged in and clicks a recovery link, they should still see the form.

### Concrete changes

**`src/contexts/AuthContext.tsx`**: In the `onAuthStateChange` handler, when `event === 'PASSWORD_RECOVERY'`, set `sessionStorage.setItem('password_recovery', '1')`.

**`src/pages/ResetPassword.tsx`**: Rewrite the `useEffect` to:
- Check `sessionStorage.getItem('password_recovery')` — if set, show form and clear the flag
- Check `window.location.hash` for `type=recovery` (keep as fallback)
- Call `supabase.auth.getSession()` — if a valid session exists and we're on `/reset-password`, show the form
- Keep `onAuthStateChange` listener for `PASSWORD_RECOVERY` as the final fallback
- Add a 3-second timeout: if nothing triggered `isRecovery` but we do have a valid session, show the form anyway (the user is clearly here from a recovery email)
