## Tight scope — only the residual gaps

The core consistency fix (mapped error messages + auto-switch on existing account) is already shipped. Three small gaps remain that match exactly what the bug describes.

### 1. Clear password on auto-switch — `src/pages/Auth.tsx`
When signup detects "account already exists" and switches to login mode, also clear the password field and surface a helper note. This prevents the immediate second error ("Incorrect email or password") that the bug report calls out as "another error is shown".

- In the `mapped.switchToLogin` branch (line 156-158) and the empty-`identities` branch (line 162-164):
  - `setPassword('')`
  - `setConfirmPassword('')`
  - Keep `formError` set to the friendly message ("An account with this email already exists. Sign in below — if you forgot your password, use Reset.")

### 2. Stop firing signup analytics for ghost signups — `src/contexts/AuthContext.tsx`
Line 107-110 currently fires `gtagSignUp` / `gtmSignUp` for any returned `data.user`, including the "user already exists" ghost user. Guard with `data.user.identities && data.user.identities.length > 0` so analytics only count real new accounts.

### 3. Apply `mapAuthError` to the marketing popup — `src/components/landing/SignupSlideUp.tsx`
Replace the generic "Something went wrong. Please try again." fallback (line 79-83) with `mapAuthError(err, 'signup').message` so this surface is consistent with the main auth page.

---

## Files touched
- `src/pages/Auth.tsx` — clear password fields on auto-switch, refine helper copy
- `src/contexts/AuthContext.tsx` — guard analytics on real new identity
- `src/components/landing/SignupSlideUp.tsx` — use `mapAuthError`

No DB / RLS / edge function / dependency changes.