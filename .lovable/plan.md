
# Fix Logo Navigation + Smart CTA for Logged-In Users

## Two Issues

1. **Sidebar logo click** -- Currently the VOVV.AI logo in the sidebar navigates to `/app` (dashboard). The user expects it to go to the homepage (`/`).
2. **Landing nav CTA** -- The "Start Free" button always shows, even when the user is already logged in. For logged-in users, it should show "My Dashboard" and navigate to `/app` instead.

## Changes

### 1. `src/components/app/AppShell.tsx`

Update the logo click handler from `handleNav('/app')` to `navigate('/')` so it goes to the landing/home page.

- Line 96: Change `onClick={() => handleNav('/app')}` to `onClick={() => navigate('/')}`
- This navigates directly without closing the mobile sidebar (since the user is leaving the app shell entirely)

### 2. `src/components/landing/LandingNav.tsx`

Import `useAuth` from `AuthContext` and conditionally render the CTA button:

- Import `useAuth` from `@/contexts/AuthContext`
- Call `const { user } = useAuth()` inside the component
- **Desktop CTA** (line 67): If `user` exists, show "My Dashboard" button that navigates to `/app`; otherwise show "Start Free" that navigates to `/auth`
- **Mobile CTA** (line 99): Same conditional logic for the mobile menu button
- Both buttons keep the same rounded-full styling

### Files changed

1. `src/components/app/AppShell.tsx` -- Logo navigates to `/` (homepage)
2. `src/components/landing/LandingNav.tsx` -- Auth-aware CTA button
