

## Investigation: What Caused the "Crashed" Dashboard

### Root Causes Identified

**1. Unguarded `getSession()` in CreditContext (the main culprit)**
- File: `src/contexts/CreditContext.tsx`, line 127
- `checkSubscription` calls `await supabase.auth.getSession()` **before** the try/catch block
- Edge function logs confirm this exact failure: `"Auth failed - Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"` — the auth endpoint returned an HTML error page instead of JSON
- When `getSession()` throws, it's an unhandled rejection that can crash the React tree
- This runs every 60 seconds (line 194), so it repeatedly destabilizes the app

**2. No global ErrorBoundary**
- Confirmed: zero `ErrorBoundary` components exist in the project
- When any unhandled error crashes the React tree, the entire app (including `AuthProvider`) unmounts
- Subsequent re-renders of `Auth` or any page calling `useAuth()` fail with `"useAuth must be used within an AuthProvider"` — the exact error from the console logs
- Result: permanent blank screen with no recovery path

**3. Stale session from multi-device logout**
- Auth logs show token refresh (`token_revoked`) happening during the same window as the crashes
- When a user logs out on one device, the other device's refresh token becomes invalid
- Supabase tries to refresh → gets an error → `getSession()` throws or returns corrupted data
- Without error handling, this cascades into the crash described above

### What's Already Fixed
The previous patches correctly hardened:
- `ProtectedRoute` — now uses `try/catch/finally` with `.maybeSingle()` (confirmed working)
- `AuthContext` — has `.catch()` on `getSession()` and a 10s safety timeout (confirmed working)
- `CreditContext.fetchCredits` — uses `try/catch/finally` (confirmed working)
- Dashboard — has `hasCriticalError` recovery UI with retry button (confirmed working)
- QueryClient — has retry config with exponential backoff (confirmed working)

### What Still Needs Fixing

**Fix 1: Guard `getSession()` in `checkSubscription`** (`src/contexts/CreditContext.tsx`)
- Move the `getSession()` call on line 127 **inside** the existing try/catch block (lines 129-144)
- This is the last unguarded async call that can produce an unhandled rejection

**Fix 2: Add a global ErrorBoundary** (`src/components/ErrorBoundary.tsx` + `src/App.tsx`)
- Create a class component that catches render errors via `componentDidCatch`
- Shows a "Something went wrong" screen with a "Reload" button
- Clears stale auth tokens from localStorage on crash (prevents crash loops on reload)
- Wrap the entire app tree in `App.tsx` with this boundary

These two changes close the remaining crash vectors. The `getSession()` fix prevents the trigger, and the ErrorBoundary prevents any future unhandled error from resulting in a permanent blank screen.

### Technical Details

**CreditContext fix** (line 127-128 moves inside try block):
```tsx
// Before (crashes if getSession throws):
const { data: { session } } = await supabase.auth.getSession();
if (!session) { checkingRef.current = false; return; }
try { ... }

// After:
try {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  // ... rest of check-subscription logic
} catch (err) { ... } finally { checkingRef.current = false; }
```

**ErrorBoundary** — standard React class component pattern wrapping `<App>` content inside `BrowserRouter`.

