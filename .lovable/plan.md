

# Remaining Design Fixes

## Issues Found

### 1. AppPricing — "Brand Models" in DETAILED_FEATURES has no NEW badge
Lines 43 and 55 in `AppPricing.tsx` have `'Brand Models'` as a plain string. The accordion expands and renders it as plain text. The NEW badge on lines 327-330 is on the plan header row, not on the feature itself.

**Fix**: Change `DETAILED_FEATURES` type to `(string | { text: string; badge: string })[]`, update Growth/Pro "Brand Models" entries to `{ text: 'Brand Models', badge: 'NEW' }`, and update the render logic inside the accordion to handle mixed types (same pattern used in plan cards).

### 2. LandingPricing — Wrong CTA variant for logged-in users
Line 155: `variant={isCurrentPlan || (!user && plan.highlighted) ? 'default' : 'outline'}` — for logged-in users, the current plan gets `default` (strongest) while upgrade plans get `outline` (weakest). This is backwards.

**Fix**: Change to: `variant={isCurrentPlan ? 'secondary' : (isHigher ? 'default' : 'outline')}` and keep `!user && plan.highlighted` for the logged-out highlight.

### 3. LandingPricing — price-per-credit text too faded
Line 129: `text-muted-foreground/50` makes the price-per-credit nearly invisible.

**Fix**: Change to `text-primary/70 font-medium` to match the style used in NoCreditsModal.

### 4. UpgradeValueDrawer — No billing toggle, only shows monthly
The drawer always uses `plan.stripePriceIdMonthly` (line 203) and shows `${plan.monthlyPrice}/mo` with no way to switch to annual.

**Fix**: Add `useState<'monthly' | 'annual'>('monthly')` billing toggle (compact, same style as NoCreditsModal), show annual price as `Math.round(annualPrice / 12)`, pass correct price ID in checkout.

### 5. AppPricing — Accordion NEW badge is on plan header, not feature
Lines 327-330 show a generic "NEW" badge next to Growth/Pro plan names in the accordion header. This is misleading — the badge should only appear next to "Brand Models" inside the expanded features, not on the plan name.

**Fix**: Remove the NEW badge from the accordion header button. The feature-level badge (from fix #1) will handle it correctly.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/AppPricing.tsx` | Fix DETAILED_FEATURES type + render for Brand Models badge; remove NEW from accordion header |
| `src/components/landing/LandingPricing.tsx` | Fix CTA variant for logged-in users; improve price-per-credit visibility |
| `src/components/app/UpgradeValueDrawer.tsx` | Add billing toggle with annual pricing support |

