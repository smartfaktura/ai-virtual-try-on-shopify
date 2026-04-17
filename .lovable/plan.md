

## Goal
Improve the password reset request UX so users don't get stuck wondering. Add a 60s resend cooldown, clearer "check spam" copy, and surface the sender address.

## Where this lives
The "forgot password" flow is in the auth page (`/auth`). I need to find the exact component handling `resetPasswordForEmail`. Likely in `src/pages/Auth.tsx` or a `ForgotPassword` component.

## Changes

### 1. Confirmation/success state after sending reset email
After successful `resetPasswordForEmail`, show a refined panel instead of just a toast:

```
✉ Check your inbox
We sent a reset link to you@example.com.

It can take a minute. Check Spam or Promotions —
the email comes from noreply@notify.vovv.ai.

[ Resend email (60s) ]   ← disabled with countdown
[ Use a different email ]
```

### 2. 60s cooldown logic
- On send success: start `cooldown = 60`, tick down every 1s via `setInterval`
- Resend button disabled while `cooldown > 0`, label shows `Resend in 58s`
- When `cooldown === 0`: button becomes active "Resend email"
- Clicking resend: re-fires `resetPasswordForEmail` with same email + restarts cooldown
- Persist last-sent timestamp in `sessionStorage` keyed by email so refresh doesn't reset cooldown

### 3. Clearer copy on initial form
Above the email input on the forgot-password screen, add a tiny muted note:
> Reset emails arrive from `noreply@notify.vovv.ai`. They sometimes land in Spam.

### 4. Toast → inline panel
Replace the success toast with the inline confirmation panel (toast disappears, this is the next thing the user sees and can act on). Keep error toast for failures.

## Files
- `src/pages/Auth.tsx` (or the forgot-password subcomponent — I'll locate exactly during implementation) — add cooldown state, sessionStorage persistence, success panel, sender hint copy

No backend changes. No new deps. Email pipeline already verified working.

## Acceptance
- After requesting reset: clear panel shows email address + spam hint + sender domain
- Resend button shows live countdown `Resend in 59s … 1s` then becomes active
- Refreshing page mid-cooldown preserves remaining time
- "Use a different email" returns to the email entry step
- Initial form shows the sender-domain hint

