

## Add Confirm Password Field to Signup Form

Add a "Confirm password" input that appears only in signup mode, with validation ensuring both passwords match.

### Changes in `src/pages/Auth.tsx`

1. Add `confirmPassword` state variable
2. Add a "Confirm password" `<Input>` field below the password field, rendered only when `mode === 'signup'`
3. Update `validate()` to check `confirmPassword` matches `password` (only in signup mode)
4. Add error state and inline error message for the confirm field
5. Clear confirm password error on input change

### Validation logic
- If confirm field is empty: "Please confirm your password"
- If passwords don't match: "Passwords do not match"

### No other files need changes

