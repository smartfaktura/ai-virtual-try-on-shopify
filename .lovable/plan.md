

## Fix: Duplicate Signup Shows Wrong Success Message

### Problem

When a user signs up with an email that already exists, Supabase returns a **200 OK with no error** (security measure to prevent email enumeration). The response contains a fake user object with an **empty `identities` array**. The current code only checks for `error`, so it falls through to `toast.success('Check your email to confirm your account!')` — misleading the user.

### Fix

**1. Update `signUp` in `AuthContext.tsx`**

Return the full `data` object alongside `error` so the caller can inspect `data.user.identities`.

**2. Update signup handler in `Auth.tsx`**

After a successful signup call, check if `data.user?.identities` is empty. If so, show a different message like "An account with this email already exists. Try signing in instead." and switch to login mode. Only show the confirmation toast when identities are present (genuine new signup).

### Files Changed
| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Return `{ data, error }` from `signUp` |
| `src/pages/Auth.tsx` | Detect duplicate signup via empty identities array, show appropriate message |

