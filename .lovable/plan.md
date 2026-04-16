

# Show Credit Banner Globally Across /app (Except Dashboard)

## What Changes

1. **Move the `LowCreditsBanner` into `AppShell`** so it appears on every `/app` page automatically — no need for each page to import it individually.

2. **Hide it on the dashboard** (`/app` or `/app/`) since the dashboard already has its own out-of-credits CTA card.

3. **Lower the threshold** so the banner shows when `balance < 4` (not just the dynamic percentage-based `isLow`).

4. **Remove per-page `LowCreditsBanner` imports** from `Dashboard.tsx`, `Generate.tsx`, `Freestyle.tsx`, and `Perspectives.tsx` to avoid duplication.

## Technical Details

### `src/components/app/LowCreditsBanner.tsx`
- Change visibility condition: show when `balance < 4` OR `isEmpty`, instead of relying on percentage-based `isLow`/`isCritical`.

### `src/components/app/AppShell.tsx` — Line 469
- Import `LowCreditsBanner`
- Add it above `{children}`, wrapped in a route check:
```tsx
{!isDashboard && <LowCreditsBanner />}
```
Where `isDashboard` checks `location.pathname === '/app' || location.pathname === '/app/'`.

### Remove per-page imports
| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Remove `LowCreditsBanner` import and usage |
| `src/pages/Generate.tsx` | Remove `LowCreditsBanner` import and usage |
| `src/pages/Freestyle.tsx` | Remove `LowCreditsBanner` import and usage |
| `src/pages/Perspectives.tsx` | Remove `LowCreditsBanner` import and usage |

