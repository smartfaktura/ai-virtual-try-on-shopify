

# Settings Page: Plans & Billing Section Implementation

## Summary

Replace the current simple "Billing & Credits" card in Settings with a comprehensive plan selection UI that showcases the pricing tiers, enables plan upgrades, and allows credit top-ups - all with a competitive angle highlighting the cost advantage.

## Business Model Recap

| Item | Our Cost | Selling Price (100% markup) |
|------|----------|---------------------------|
| Standard image (1 credit) | $0.004 (0.4 ct) | $0.008 (0.8 ct) |
| Virtual Try-On (3 credits) | $0.012 (1.2 ct) | $0.024 (2.4 ct) |

**Free trial**: 5 credits per store (one-time)

## New UI Layout

The Settings page will get an expanded "Plans & Billing" section with:

```text
+------------------------------------------------------------------+
|  CURRENT PLAN STATUS                                              |
|  [Free Trial]  5/5 credits remaining                              |
|  "Upgrade to unlock more features and credits"                    |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|  CHOOSE YOUR PLAN                     [Monthly] [Annual -17%]     |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+  +---------------+  +-------------+  +---------+ |
|  |   STARTER   |  |    GROWTH     |  |     PRO     |  |ENTERPRISE|
|  |   $9/mo     |  |    $29/mo     |  |   $79/mo    |  | Custom  | |
|  |             |  |  MOST POPULAR |  |             |  |         | |
|  | 100 credits |  |  500 credits  |  | 2000 credits|  |Unlimited| |
|  |             |  |  +Try-On      |  |  +API       |  |+SLA     | |
|  |  [Select]   |  |   [Select]    |  |  [Select]   |  |[Contact]| |
|  +-------------+  +---------------+  +-------------+  +---------+ |
|                                                                   |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|  NEED MORE CREDITS?  (Top-up packs, credits never expire)         |
|                                                                   |
|  [50 credits - $5]  [200 credits - $15]  [500 credits - $30]      |
|       10 ct/ea           7.5 ct/ea            6 ct/ea             |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|  COMPETITOR COMPARISON                                            |
|  "Save 60-80% compared to alternatives"                           |
|  Us: $0.008/image | Competitor A: $0.03 | Competitor B: $0.05     |
+------------------------------------------------------------------+
```

## Technical Implementation

### New Type Definitions (`src/types/index.ts`)

```typescript
export interface PricingPlan {
  planId: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export interface CreditPack {
  packId: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
}
```

### New Mock Data (`src/data/mockData.ts`)

Add `pricingPlans` and `creditPacks` arrays with the pricing tiers.

### New Components

| Component | Purpose |
|-----------|---------|
| `src/components/app/PlanCard.tsx` | Individual plan card with features, price, and CTA |
| `src/components/app/CreditPackCard.tsx` | Credit top-up pack card |
| `src/components/app/CompetitorComparison.tsx` | Side-by-side price comparison banner |

### Settings Page Updates (`src/pages/Settings.tsx`)

1. Replace "Billing & Credits" card with expanded "Plans & Billing" section
2. Add state for billing period toggle (monthly/annual)
3. Display current plan status prominently
4. Show all plan cards in a responsive grid
5. Add credit top-up section below plans
6. Add competitor comparison for social proof

## Visual Design

- **Current plan**: Highlighted with `Badge tone="success"`
- **Most Popular (Growth)**: Green border, "MOST POPULAR" badge
- **Annual toggle**: Shows savings percentage
- **Top-up cards**: Horizontal row with "Best Value" badge on largest pack
- **Competitor comparison**: Subtle banner with checkmark icons

## Plan Features Breakdown

| Feature | Starter | Growth | Pro |
|---------|---------|--------|-----|
| Credits/month | 100 | 500 | 2,000 |
| All templates | Yes | Yes | Yes |
| Virtual Try-On | No | Yes | Yes |
| Priority queue | No | Yes | Yes |
| API access | No | No | Yes |
| Bulk generation | No | No | Yes |
| Support | Standard | Priority | Dedicated |

## File Changes Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add PricingPlan and CreditPack interfaces |
| `src/data/mockData.ts` | Add pricingPlans and creditPacks data |
| `src/components/app/PlanCard.tsx` | Create new component |
| `src/components/app/CreditPackCard.tsx` | Create new component |
| `src/components/app/CompetitorComparison.tsx` | Create new component |
| `src/pages/Settings.tsx` | Replace Billing section with full Plans UI |

