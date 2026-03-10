

## Replace Toast Errors with Inline Form Errors

### Problem
Auth errors (invalid credentials, account exists, rate limit, etc.) show as toast notifications in the corner. This is poor UX — errors should appear inline near the form fields.

### Changes

**`src/pages/Auth.tsx`**:

1. Add a new `formError` state for general form-level errors (not field-specific)
2. Replace all `toast.error(...)` calls in `handleSubmit` with inline error state:
   - Login `error.message` ("Invalid login credentials") → set `formError` with friendly text: "Incorrect email or password. Please try again."
   - Signup existing account → set `formError`: "An account with this email already exists." + auto-switch to login
   - Rate limit → set `formError` with the existing message (instead of `toast.info`)
   - Generic errors → set `formError` with user-friendly message
3. Render `formError` as a styled inline alert above the submit button — red background, icon, clear text
4. Clear `formError` when user changes email/password or switches mode
5. Keep `toast.success` for positive confirmations (those are fine as toasts)

### Error message improvements
- `"Invalid login credentials"` → `"Incorrect email or password. Please try again."`
- `"User already registered"` → `"An account with this email already exists."`  
- Rate limit → `"Verification email already sent. Check your inbox or wait a moment."`
- Generic fallback → `"Something went wrong. Please try again."`

### UI for inline error
A subtle destructive alert box rendered between the last input and the submit button:
```
┌─────────────────────────────────┐
│ ⚠ Incorrect email or password. │
│   Please try again.            │
└─────────────────────────────────┘
```

Uses existing `text-destructive` styling with `bg-destructive/10` rounded container, no external dependencies needed.

