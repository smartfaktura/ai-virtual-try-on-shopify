
## Fix first-time dashboard flicker (showing returning view for ~1s)

### Root cause
`Dashboard.tsx` currently decides mode with:
- `isNewUser = recentJobs.length === 0 && !jobsLoading`
- While `jobsLoading` is `true` on first paint, `isNewUser` is `false`, so returning-user UI renders first, then flips to first-run UI.

## Implementation plan

### 1) Add a dedicated, lightweight dashboard-mode resolver
**File:** `src/pages/Dashboard.tsx`

- Add a fast query (separate from full `recentJobs`) that only checks whether the user has ever generated content:
  - `generation_jobs` (`select('id').limit(1)`)
  - `freestyle_generations` (`select('id').limit(1)`)
- Derive `dashboardMode` from this resolver:
  - `new` if no activity
  - `returning` if any activity
  - `resolving` while query is pending

### 2) Never render returning cards while mode is unresolved
**File:** `src/pages/Dashboard.tsx`

- Replace current `isNewUser` branching with explicit mode branching.
- During `resolving`, render a neutral lightweight placeholder (not returning metrics/cards), so first-time users never see returning content flash.
- Keep existing no-skeleton metric behavior for returning users once mode is known.

### 3) Make first-time transition deterministic right after onboarding
**Files:**  
- `src/pages/Onboarding.tsx`  
- `src/pages/Dashboard.tsx`

- On successful onboarding save, set a local flag (scoped by user id) like `dashboard_mode_hint = 'new'` before navigating to `/app`.
- In Dashboard, read this hint on mount and prefer `new` immediately.
- Auto-clear the hint once activity is detected (user has generated content).

### 4) Guard returning-only sections from loading misstates
**File:** `src/pages/Dashboard.tsx`

- Ensure returning-only widgets (especially Recent Jobs empty state) don’t show “No jobs yet” while their query is still loading.
- Show loading placeholder/spinner until query settles to avoid false empty flashes.

## Technical details
- Keep the current heavy `recentJobs` query for actual table data; use the new lightweight activity query only for dashboard-mode decision.
- Preserve existing brand/UI layout; this is a behavior/state-flow fix only.
- No backend schema changes required.

## Acceptance checks
1. First-time user landing on `/app` never sees returning metrics/cards, even briefly.
2. Returning user still sees dashboard quickly, without metric skeleton flash.
3. After onboarding completion, user lands directly into first-run dashboard state.
4. Recent Jobs does not flash incorrect empty state during loading.
