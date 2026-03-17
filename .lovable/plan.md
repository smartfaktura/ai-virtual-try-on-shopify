

## Show "Sign In" for Returning Users on Landing Nav

### Problem
Users who have registered and later get logged out only see "Start Free" — there's no "Sign In" option, which is confusing for returning users.

### Approach
Use `localStorage` to detect returning users. When a user logs in, we set a flag (`has_account=true`). This flag persists after logout. On the landing nav, we check this flag to show the appropriate CTA.

### Changes

**1. `src/contexts/AuthContext.tsx`** — Set `localStorage` flag on successful session:
- Inside the `onAuthStateChange` callback, when a session is established, set `localStorage.setItem('has_account', 'true')`

**2. `src/components/landing/LandingNav.tsx`** — Update CTA text logic:
- Read `localStorage.getItem('has_account')` once on mount
- Change button text from binary (`user ? 'My Dashboard' : 'Start Free'`) to:
  - `user` → "My Dashboard"
  - `!user && hasAccount` → "Sign In"  
  - `!user && !hasAccount` → "Start Free"
- Apply to both desktop (line 72) and mobile (line 111) buttons
- Both buttons navigate to `/auth` for non-logged-in users (same as now)

### Result
- **First-time visitors**: See "Start Free" (encouraging signup)
- **Returning logged-out users**: See "Sign In" (they know they have an account)
- **Logged-in users**: See "My Dashboard" (unchanged)

No database changes needed — purely a client-side UX enhancement.

