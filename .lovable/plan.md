

## Replace Signup Toast with Confirmation Screen

After successful signup, instead of showing a toast, transition the Auth page to a branded "Check your email" confirmation view.

### Changes in `src/pages/Auth.tsx`

1. **Add `signupComplete` state** (boolean, default false) and store the submitted email
2. **On successful signup**: set `signupComplete = true` instead of showing a toast
3. **Render confirmation screen** when `signupComplete` is true — replaces the form with:
   - Mail icon (from lucide-react, e.g. `MailCheck` or `Mail`)
   - Heading: "Check your inbox"
   - Subtitle: "We sent a confirmation link to {email}"
   - Muted helper text: "Click the link in your email to activate your account. Check spam if you don't see it."
   - "Back to sign in" button that resets state and switches to login mode
4. **Keep the right-side hero image** visible — only the left form panel changes

### No other files need changes

