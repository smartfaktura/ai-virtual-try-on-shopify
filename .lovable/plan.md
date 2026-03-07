

## Forgot Password - Proper Dialog Flow

Currently, clicking "Forgot password?" requires the email field to already be filled and shows an error toast if it's empty. This is poor UX.

### Changes

**File: `src/pages/Auth.tsx`**

1. Add a `forgotPassword` state boolean and a separate `resetEmail` state
2. Replace the inline "Forgot password?" button logic with opening a Dialog modal
3. The dialog contains:
   - Title: "Reset your password"
   - Subtitle: "Enter your email and we'll send you a reset link"
   - Email input (pre-filled from the login email field if available)
   - "Send reset link" button that calls `supabase.auth.resetPasswordForEmail`
   - "Back to sign in" link to close
4. Show success state inside the dialog after sending (checkmark + "Check your inbox" message) instead of just a toast

This uses the existing `Dialog` component from `src/components/ui/dialog.tsx`. No new files needed.

### File changed
- `src/pages/Auth.tsx`

