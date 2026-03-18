
Goal: fix the “dashboard looks crashed / never loads” behavior so the app always recovers gracefully from backend/network failures.

What I found
- The latest client/network logs show a failed backend request (`check-subscription`: `Failed to fetch`).
- Backend read queries are intermittently timing out (status 544), so transient backend instability is real.
- `ProtectedRoute` can deadlock on loading: onboarding check uses `.single()` + `.then(...)` with no `.catch/.finally`; if request rejects, `onboardingChecked` may never flip to `true`, leaving infinite “Loading…”.
- `AuthContext` and `CreditContext` have startup paths without strong `try/catch/finally` protection, so loading flags can get stuck during network failures.
- Dashboard queries don’t present a clear recovery UI when core queries fail.

Implementation plan
1) Harden route-gating so it cannot hang
- File: `src/components/app/ProtectedRoute.tsx`
- Replace current onboarding check with guarded async flow:
  - reset `onboardingChecked` before request
  - use `.maybeSingle()` (not `.single()`) for profile lookup
  - handle network/query errors explicitly
  - set `onboardingChecked` in `finally` so route never stays blocked
  - keep onboarding redirect logic for valid `onboarding_completed === false`

2) Harden auth bootstrap
- File: `src/contexts/AuthContext.tsx`
- Wrap initial session restore in `try/catch/finally` and guarantee `isLoading` is cleared even on fetch/session restore errors.
- Add a short safety timeout fallback (last-resort) so auth bootstrap cannot freeze the app.

3) Harden credit bootstrap + noisy failure path
- File: `src/contexts/CreditContext.tsx`
- In `fetchCredits`, switch to `.maybeSingle()` and always clear `isLoading` in `finally`.
- Keep defaults when profile is missing/unreachable.
- Keep `checkSubscription` non-blocking; log failure once per interval cycle without impacting page render.

4) Add dashboard recovery UI for failed core queries
- File: `src/pages/Dashboard.tsx`
- Track `isError`/`error` for critical queries (profile, recent jobs, generated count, schedules).
- If critical load fails, render a clear inline error state with retry action (`refetch` or page reload), instead of “looks dead”.

5) Improve global query resilience
- File: `src/App.tsx`
- Update QueryClient defaults for flaky connections:
  - `retry` + bounded `retryDelay`
  - `refetchOnReconnect: true`
  - keep current `refetchOnWindowFocus: false`
- This reduces “one failed request = stuck state” cases.

Technical notes
- No database schema changes needed.
- This is a client resilience patch, not a business-logic change.
- It preserves existing onboarding/auth behavior while preventing infinite loading states under transient outages.

Validation checklist (end-to-end)
1. Open `/app` with normal network: dashboard loads normally.
2. Simulate offline during `/app` load: app should not stay on infinite loader; show recoverable error state.
3. Reconnect network: dashboard should recover via retry/reconnect.
4. User with `onboarding_completed=false`: still redirects to onboarding.
5. User with missing profile row: app should still load safely (no deadlock).
6. Confirm no regressions in Freestyle/Generate/Library navigation from AppShell.
