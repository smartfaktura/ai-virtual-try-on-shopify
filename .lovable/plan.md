

## Update Credit Tiers, Top-Up Packs, and Image Estimates

### Overview

Revise subscription credit amounts, reprice top-up packs to incentivize subscriptions over one-time purchases, and fix the misleading "approx images" estimate across the app.

### Final Pricing Scheme

**Subscriptions:**
- Free: 20 credits (unchanged)
- Starter: 500 credits/mo at $39/mo (was 1,000)
- Growth: 1,500 credits/mo at $79/mo (was 2,500)
- Pro: 4,500 credits/mo at $179/mo (was 6,000)

**Top-Up Packs (priced higher per credit than subs):**
- Small: 200 credits for $15 (7.5 cents/credit)
- Medium: 500 credits for $29 (5.8 cents/credit, "Best Value" badge)
- Large: 1,500 credits for $69 (4.6 cents/credit)

**Image estimate fix:** Change from credits/4 to credits/10 everywhere.

---

### Changes by File

#### 1. src/contexts/CreditContext.tsx
Update PLAN_CONFIG monthly credit quotas:
- starter: 1000 to 500
- growth: 2500 to 1500
- pro: 6000 to 4500

#### 2. src/data/mockData.ts

**pricingPlans array** -- update credits and feature strings:
- Starter: credits 1000 to 500, feature "1,000 credits/month" to "500 credits/month"
- Growth: credits 2500 to 1500, feature "2,500 credits/month" to "1,500 credits/month"
- Pro: credits 6000 to 4500, feature "6,000 credits/month" to "4,500 credits/month"

**creditPacks array** -- replace all three packs:
- pack_200: 200 credits, $15, pricePerCredit 0.075
- pack_500: 500 credits, $29, pricePerCredit 0.058, popular: true
- pack_1500: 1,500 credits, $69, pricePerCredit 0.046

#### 3. src/components/app/CreditPackCard.tsx (line 21)
Change image estimate from `pack.credits / 4` to `pack.credits / 10`.

#### 4. src/components/landing/LandingPricing.tsx (line 82)
Change image estimate from `plan.credits / 4` to `plan.credits / 10`.

#### 5. src/components/app/BuyCreditsModal.tsx
Search for any `/4` image estimate calculations and update to `/10`. Also verify top-up pack rendering works with new data.

#### 6. src/components/app/NoCreditsModal.tsx
Same -- verify image estimate if present, update `/4` to `/10`.

---

### Technical Notes

- No database changes needed. Credit quotas are frontend config; actual balances live in the profiles table.
- The PLAN_CONFIG in CreditContext drives the low/critical warning thresholds (20% and 5% of monthly quota), so those will automatically adjust to the new amounts.
- Stripe product/price objects will need to be updated separately when Stripe integration is finalized.

