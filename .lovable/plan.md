

## Unify dashboard — use new-user layout for everyone

### Plan
In `src/pages/Dashboard.tsx`, remove the returning-user branch entirely and render the new-user layout for all authenticated users (regardless of `generatedCount` / first-visit state).

### Changes
1. **Delete the returning-user JSX block** (Welcome back heading + Tools + Quick actions + Plan & Credits + Discover + Recent + Feedback sections).
2. **Always render the new-user layout** — the one with the "Tools" cards (Create Product Visuals / Create with Prompt / Explore Examples) the user already approved.
3. **Update the greeting** in the unified layout to be friendly for both first-time AND returning users: keep the welcome line but use a name-aware greeting like `Welcome{firstName ? `, ${firstName}` : ''} 👋` so returning users still feel acknowledged.
4. **Cleanup**: remove now-unused imports, queries, state, and modals only used by the deleted branch (`UpgradePlanModal`, `upgradeOpen`, `EarnCreditsModal` if unused, `DashboardDiscoverSection` if unused, `lastJob`/`topWorkflow`/`generatedCount` queries, `useCredits` destructure if unused, etc.).
5. Keep `LowCreditsBanner` at top so credit status is still visible.
6. New-user layout's existing structure (Tools cards + whatever else it currently shows) stays untouched.

### Acceptance
- All users see the same dashboard (the current new-user layout)
- No conditional first-visit branching
- Greeting works for both new and returning users
- No dead imports / unused queries / console errors
- `/app` route still loads cleanly

