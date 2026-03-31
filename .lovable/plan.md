
## Diagnosis (what’s actually wrong)

I re-checked the auth logs and email logs: this is **not** an email infrastructure outage.  
The main failure is **rate limiting on signup email sends** (`429 over_email_send_rate_limit`).

Why this happens in code:
- In `src/pages/Auth.tsx`, after a successful signup, the app immediately calls a second send (`auth.resend`) right away.
- So one signup can trigger duplicate email-send attempts, and repeated retries quickly hit the auth email rate limit.
- Once rate-limited, users see “not sending” behavior even when the system is otherwise healthy.

## Implementation plan

1. **Remove duplicate send on signup**
   - Edit `src/pages/Auth.tsx`.
   - Keep the initial signup email send from signup itself.
   - Remove the immediate extra resend call right after signup success.

2. **Strengthen resend UX to avoid rate-limit loops**
   - Keep resend only on explicit user action.
   - Increase resend cooldown (current 30s is too short for this flow).
   - Disable resend action until cooldown ends.

3. **Make rate-limit messaging clear and consistent**
   - Normalize rate-limit handling in one helper in `Auth.tsx` (signup, magic link, resend, reset).
   - Show explicit message like: “Email was already sent recently. Please wait a few minutes and check spam/promotions.”

4. **Prevent accidental rapid re-submits**
   - While request is in-flight, lock the relevant action buttons.
   - Ensure users cannot fire multiple signup/resend calls by double-clicking.

5. **Validation after change**
   - Test signup once with a fresh email → expect one confirmation send path.
   - Test resend before cooldown → blocked by UI.
   - Test resend after cooldown → allowed.
   - Confirm auth logs no longer show immediate duplicate send pattern from a single signup action.

## Technical details (files)

- **Update:** `src/pages/Auth.tsx`
  - Remove post-signup immediate resend call.
  - Add unified rate-limit error parser.
  - Increase resend cooldown and tighten button disabled states.
  - Improve user-facing error/cooldown text.

- **No backend function changes needed** for this fix (auth-email-hook/queue are behaving as expected).
