

## Fix: OAuth Redirect Sends Users to Landing Page Instead of App

### The Problem
When users sign in with Google or Apple, the OAuth `redirect_uri` is set to `window.location.origin` (the root `/`). After authentication completes, users land on the **Landing page** instead of being taken into the app. They have to manually navigate to `/app`, which then checks if onboarding is needed.

### The Fix
Two changes are needed:

**1. Update OAuth redirect_uri in Auth.tsx (lines ~89 and ~107)**
Change `redirect_uri: window.location.origin` to `redirect_uri: window.location.origin + '/app'` for both Google and Apple sign-in buttons. This sends users directly to the protected app route after OAuth, which will:
- Show the dashboard if onboarding is complete
- Redirect to `/onboarding` if onboarding is not complete

**2. Add auth-aware redirect on the Landing page**
Add a simple check at the top of the Landing page component: if the user is already authenticated, redirect them to `/app`. This handles edge cases where users visit `/` while logged in (e.g., typing the URL directly or bookmarking it).

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Change `redirect_uri` from `window.location.origin` to `window.location.origin + '/app'` (2 places: Google and Apple buttons) |
| `src/pages/Landing.tsx` | Add `useAuth()` check -- if user is logged in, redirect to `/app` |

### Technical Details

In `Auth.tsx`, the Google button (around line 89):
```typescript
// Before
redirect_uri: window.location.origin,
// After
redirect_uri: window.location.origin + '/app',
```

Same change for the Apple button (around line 107).

In `Landing.tsx`, add at the top of the component:
```typescript
const { user, isLoading } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!isLoading && user) {
    navigate('/app', { replace: true });
  }
}, [user, isLoading, navigate]);
```

