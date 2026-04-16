

# BuyCreditsModal — Plan-Aware Redesign

## Problem
The BuyCreditsModal (opened from Settings/sidebar) still shows all 4 plans including Free for all users. A Pro user sees "Downgrade to Free", "Downgrade to Starter", "Downgrade to Growth" which is unhelpful when they ran out of credits.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx`

**1. Free users — hide "Top Up" tab entirely**
Free users can't top up (no subscription). Show only the "Plans" tab with 3 subscribable plans (Starter/Growth/Pro), no Free card. Remove the tab switcher for free users.

**2. Starter/Growth users — keep both tabs as-is, but improve "Plans" tab**
- "Top Up" tab: unchanged (credit packs)
- "Plans" tab: only show plans at or above current tier. Hide Free plan and plans below current. Show upgrade CTAs with `variant="default"`, current plan with `variant="secondary"`.

**3. Pro users — hide "Plans" tab, show Top Up + Enterprise CTA**
Pro users have no upgrade path. Remove the tab switcher. Show only credit packs + an Enterprise CTA bar at the bottom (same `EnterpriseCTA` pattern from NoCreditsModal).

**4. Tab default logic**
- Free: force `upgrade` tab (plans), hide tab switcher
- Starter/Growth: default to `topup`, show both tabs
- Pro: force `topup`, hide tab switcher, add Enterprise CTA below packs

### Implementation detail

```
// Plans tab filtering
const plansToShow = mainPlans.filter(p => {
  if (plan === 'free') return p.planId !== 'free';
  const currentIdx = PLAN_ORDER.indexOf(plan);
  const targetIdx = PLAN_ORDER.indexOf(p.planId);
  return targetIdx >= currentIdx;
});
```

- For Pro users, add `<EnterpriseCTA />` (reuse from NoCreditsModal or extract shared component) below the top-up grid
- Tab switcher conditionally rendered: hidden for free users (only Plans) and pro users (only Top Up)
- Billing toggle still shown on Plans tab when visible

