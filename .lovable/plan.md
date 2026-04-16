

# Hide Credit Banner on Settings Page

## Problem
The global `LowCreditsBanner` shows on `/app/settings`, which is redundant since Settings already contains the plan/credits management UI.

## Fix

### `src/components/app/AppShell.tsx`

Add `/app/settings` to the exclusion list:

**Before:**
```tsx
{location.pathname !== '/app' && location.pathname !== '/app/' && !location.pathname.startsWith('/app/freestyle') && <LowCreditsBanner />}
```

**After:**
```tsx
{location.pathname !== '/app' && location.pathname !== '/app/' && !location.pathname.startsWith('/app/freestyle') && !location.pathname.startsWith('/app/settings') && <LowCreditsBanner />}
```

| File | Change |
|------|--------|
| `src/components/app/AppShell.tsx` | Exclude `/app/settings` from global banner |

