

# Make /pricing Page Dynamic (Match Homepage Data)

## Problem
The `/pricing` page has **hardcoded** JSON-LD offers (Starter $29, Pro $79, Business $199) that don't match the actual plan data in `pricingPlans` (Starter $39, Growth $79, Pro $179). The pricing section itself already renders `<LandingPricing />` which uses the shared `pricingPlans` data — so the visual cards are correct, but the structured data is stale.

## Solution
Generate the JSON-LD `offers` array dynamically from the `pricingPlans` data source, so it always stays in sync.

## Changes

### `src/pages/Pricing.tsx`

1. Import `pricingPlans` from `@/data/mockData`
2. Build the `pricingJsonLd.offers` array dynamically by mapping over `pricingPlans` (excluding enterprise):
   ```ts
   offers: pricingPlans
     .filter(p => !p.isEnterprise)
     .map(p => ({
       '@type': 'Offer',
       name: p.name,
       price: String(p.monthlyPrice),
       priceCurrency: 'USD',
       url: `${SITE_URL}/pricing`,
       availability: 'https://schema.org/InStock',
     }))
   ```
3. Remove the hardcoded `pricingJsonLd` constant and replace with this dynamic version

This is a single-file change — the visual pricing cards are already dynamic via `<LandingPricing />`.

