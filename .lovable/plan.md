I checked the current auth/email flow and found two important issues:

1. The password reset request is reaching the backend and returns success, but no recent recovery email is being logged or queued. Signup emails are still logging/sending, so the email domain itself is verified and working.
2. The account you appear to be testing with was created through Google only and has no email/password identity attached. For Google-only accounts, a password reset link may not create a normal password login path the way users expect.

I already redeployed the auth email handler once to refresh the backend routing, but because recovery emails still are not appearing in the send log, I want to make the app safer and clearer rather than showing a misleading “sent” success every time.

Plan:

1. Improve forgot-password behavior in `src/pages/Auth.tsx`
   - Normalize the reset email before sending.
   - Keep the current “check inbox” success for privacy, but update copy so it does not imply delivery is guaranteed.
   - Add clearer guidance for Google-only accounts: “If you signed up with Google, continue with Google instead.”
   - Add a direct “Continue with Google” action in the reset dialog.

2. Make email/password login safer for unverified users
   - If login fails because the email is not confirmed, show the existing verification guidance and keep the user on the right path.
   - Avoid suggesting a password reset as the primary fix for accounts that may not yet have an email/password login.

3. Refresh/redeploy the auth email handler after the UI changes
   - Deploy the existing auth email handler again so the live backend uses the latest version.
   - Check backend logs and the email send log after you test another reset request.

4. If recovery emails still do not appear in the log after the above
   - Re-run the managed email infrastructure setup to refresh the email queue/automation connection.
   - Re-deploy the auth email handler.
   - Re-check the log for a new `recovery` email entry.

What this will fix:
- Users will no longer be falsely assured that an email definitely arrived when the backend did not actually enqueue one.
- Google-only users won’t be pushed into a broken password reset path.
- The recovery email pipeline will be refreshed and verified from logs after testing.