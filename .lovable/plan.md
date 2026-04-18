

## Dashboard — drop redundant "Continue creating" H2 for returning users

Scope: `src/pages/Dashboard.tsx` only.

### Problem
Returning users see two stacked headlines:
- H1: "Welcome back, Tomas 👋" + subtitle "Your AI photography studio is ready — choose how you want to start"
- H2: "Continue creating" (immediately below, redundant)

The H2 repeats the intent already set by the H1 + subtitle, creating visual noise and weak rhythm.

### Change
In the "Start here" section (lines ~110–112), conditionally render the H2:
- **Returning users** (`isReturning === true`): omit the H2 entirely. Cards follow directly after the welcome subtitle with proper spacing.
- **New users** (`isReturning === false`): keep the existing "Start here" H2 (acts as orientation for first-time users).

### Implementation
Replace:
```tsx
<div className="space-y-4">
  <h2 className="text-2xl sm:text-3xl font-bold ...">{isReturning ? 'Continue creating' : 'Start here'}</h2>
  <div className="grid ...">
```

With:
```tsx
<div className="space-y-4">
  {!isReturning && (
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Start here</h2>
  )}
  <div className="grid ...">
```

Spacing: the parent wrapper already uses `space-y-8 sm:space-y-10`, so the cards will sit naturally below the welcome block with consistent rhythm. No extra margin tweaks needed.

### Acceptance
- Returning user: Welcome H1 + subtitle → 3 cards directly (no "Continue creating" header)
- New user: unchanged — "Start here" H2 still appears above cards
- All other dashboard sections untouched

