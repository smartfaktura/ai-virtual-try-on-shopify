

## Dashboard — remove "Start here" H2 entirely

Scope: `src/pages/Dashboard.tsx` only.

### Change
Remove the conditional H2 ("Start here") that currently renders for new users. Cards follow directly after the welcome H1 + subtitle for everyone.

### Implementation
In the "Start here" section (~lines 110–113), delete:
```tsx
{!isReturning && (
  <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Start here</h2>
)}
```

Keep the `<div className="space-y-4">` wrapper — parent `space-y-8 sm:space-y-10` already provides clean rhythm between the welcome block and cards.

### Acceptance
- Both new and returning users: Welcome H1 + subtitle → 3 action cards directly
- No "Start here" or "Continue creating" H2 anywhere on `/app`
- All other dashboard sections untouched

