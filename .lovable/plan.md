

## Fix: Show Sign-In form for returning users

### Problem
The landing nav correctly detects returning users via `localStorage.getItem('has_account')` and shows "Sign In" instead of "Start Free". But when clicked, the Auth page always defaults to the **signup** form (`useState<'login' | 'signup'>('signup')` on line 21), ignoring the returning-user signal.

### Fix
In `src/pages/Auth.tsx`, change the initial `mode` state to check `localStorage` on mount:

```typescript
const [mode, setMode] = useState<'login' | 'signup'>(
  () => localStorage.getItem('has_account') === 'true' ? 'login' : 'signup'
);
```

This is a one-line change. When a returning user clicks "Sign In", they'll land on the login form. New visitors clicking "Start Free" will still see the signup form.

### Files changed
- `src/pages/Auth.tsx` — line 21 only

