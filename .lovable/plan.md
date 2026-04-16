

# Fix Duplicate Banner on Freestyle

## Problem
The global `LowCreditsBanner` added to `AppShell` is appearing on `/app/freestyle`, but Freestyle already has its own credit UI built into the prompt panel (Get Credits button + No Credits modal). This creates two redundant banners stacked at the top.

## Fix

### `src/components/app/AppShell.tsx` — Line 471

Add `/app/freestyle` to the exclusion list so the global banner doesn't show there:

**Before:**
```tsx
{location.pathname !== '/app' && location.pathname !== '/app/' && <LowCreditsBanner />}
```

**After:**
```tsx
{location.pathname !== '/app' && location.pathname !== '/app/' && !location.pathname.startsWith('/app/freestyle') && <LowCreditsBanner />}
```

| File | Change |
|------|--------|
| `src/components/app/AppShell.tsx` | Exclude `/app/freestyle` from global banner |

