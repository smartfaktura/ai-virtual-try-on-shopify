

## Fix: Allow Logged-in Users to Visit the Landing Page

### Problem
The `Landing.tsx` page has a `useEffect` that automatically redirects authenticated users to `/app`. This means once you're logged in, you can never see the homepage/landing page -- clicking the logo or navigating to `/` always bounces you into the dashboard.

### Solution
Remove the auto-redirect from `Landing.tsx`. Instead, just let logged-in users view the landing page normally. The nav already shows "My Dashboard" for logged-in users, so they can navigate to the app when they want.

### Changes

**`src/pages/Landing.tsx`**
- Remove the `useEffect` that redirects logged-in users to `/app`
- Remove unused imports (`useEffect`, `useNavigate`, `useAuth`)

**`src/components/landing/LandingNav.tsx`**
- Update the logo link: when logged in, clicking the logo should go to `/` (landing) instead of defaulting to `#`. This is already fine since `href="#"` stays on the current page, but no changes needed here.

This is a minimal, safe change -- just removing the forced redirect so users can freely browse the landing page regardless of auth state.
