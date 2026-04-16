

## Changes

### 1. `UpgradePlanModal.tsx`
- Rename **"See all plans"** button → **"Compare plans"**
- Change `handleSeeAll` to navigate to `/app/pricing` instead of `/app/settings`
- Apply to both variants (upgrade + topup) for consistency — currently only upgrade variant shows it; topup variant shows "Maybe later". Keep "Maybe later" for topup, only rename in upgrade variant.

### 2. Hide `LowCreditsBanner` on `/app/pricing`
The banner ("You're out of credits / Get Credits") is rendered somewhere in the app shell. Need to find where `LowCreditsBanner` is mounted and conditionally hide it when `location.pathname === '/app/pricing'`.

Quick discovery needed: search for `<LowCreditsBanner` to find mount point, then add a `useLocation()` check to skip rendering on `/app/pricing`.

## Files to edit
- `src/components/app/UpgradePlanModal.tsx` — button text + navigate target
- Wherever `LowCreditsBanner` is mounted (likely `AppShell` or similar) — add pathname guard

## Out of scope
- No data, Stripe, or other modal logic changes.

