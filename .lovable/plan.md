

## Goal

Update the upgrade modal plan cards to show **accurate plan info** (real names, prices, credits from `PLAN_CONFIG` / `pricingPlans`) and an **approximate image count** based on ~5 credits per image.

## Real plan data (from `CreditContext` + mockData)

- Free: 20 credits → ~4 images
- Starter: 500 credits → ~100 images
- Growth: 1,500 credits → ~300 images
- Pro: 4,500 credits → ~900 images
- Enterprise: custom

## Changes to plan from previous step

In `UpgradePlanModal.tsx`, each upgrade plan card now renders:

```text
( ) Starter           $19/mo
    500 credits · ~100 images/mo

(•) Growth            $49/mo   ← preselected
    1,500 credits · ~300 images/mo

( ) Pro               $99/mo
    4,500 credits · ~900 images/mo
```

### Implementation details
- Add a small constant `CREDITS_PER_IMAGE = 5` at the top of `UpgradePlanModal.tsx`.
- Helper: `const approxImages = Math.floor(credits / CREDITS_PER_IMAGE).toLocaleString()`.
- Replace the current single feature line (`"500 credits • core features"`) with: `{credits.toLocaleString()} credits · ~{approxImages} images/mo`.
- Pull credits from `targetPlan.credits` (already used in the existing modal).
- Annual toggle stays — when annual, still show monthly-equivalent price and the same monthly credit allotment (since credits renew monthly regardless of billing cadence).
- Add a tiny footnote under the list: `"Estimates based on ~5 credits per standard image."` in `text-[11px] text-muted-foreground`.

### Everything else from the prior approved plan stays
1. Drop `Sparkles` icon in `CreditIndicator.tsx`, scale balance to `text-2xl font-semibold tracking-tight`.
2. Mobile header empty-state pill becomes white in `AppShell.tsx`.
3. Upgrade modal lists all higher tiers (Starter / Growth / Pro for Free users), cheapest preselected, single "Continue to checkout" CTA uses selected `priceId`.

## Expected result

Users immediately understand what each tier gets them in concrete terms ("~300 images/mo") instead of abstract credit counts, making the upgrade decision faster and more confident.

