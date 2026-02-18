

## Stripe Integration - Implementation Ready

### Completed: Phase 1 - Stripe Setup

Stripe is connected and all products/prices have been created:

**Subscription Plans:**

| Plan | Monthly Price ID | Annual Price ID |
|------|-----------------|-----------------|
| Starter ($39/mo) | `price_1T26oWC8WPO5rhKrKggeWeLh` | `price_1T26pAC8WPO5rhKrvWHK7Lvb` |
| Growth ($79/mo) | `price_1T26pOC8WPO5rhKrjBpH0lgw` | `price_1T26pcC8WPO5rhKr4w4koC4C` |
| Pro ($179/mo) | `price_1T26psC8WPO5rhKrGbOwmpNy` | `price_1T26qCC8WPO5rhKrKubiCvsd` |

**Credit Packs (one-time):**

| Pack | Price ID |
|------|----------|
| 200 credits ($15) | `price_1T26qSC8WPO5rhKr4t7gyY8o` |
| 500 credits ($29) | `price_1T26qgC8WPO5rhKrF3wKkeft` |
| 1,500 credits ($69) | `price_1T26qxC8WPO5rhKrEZNQVZdu` |

---

### Remaining Implementation

**Phase 2: Database Migration**
- Add `stripe_customer_id`, `subscription_status`, `stripe_subscription_id`, `current_period_end` columns to `profiles` table

**Phase 3: Edge Functions (3 new functions)**
1. `create-checkout` -- creates Stripe Checkout sessions for both subscriptions and credit packs
2. `check-subscription` -- verifies subscription status from Stripe, syncs plan/credits to database
3. `customer-portal` -- creates Stripe Billing Portal sessions for subscription management

**Phase 4: Frontend Wiring**
1. Update `src/types/index.ts` -- add `stripePriceId` fields to `PricingPlan` and `CreditPack`
2. Update `src/data/mockData.ts` -- add Stripe Price IDs to plans and packs
3. Update `src/contexts/CreditContext.tsx` -- fetch real subscription data, call `check-subscription` on login, replace placeholder cancel/reactivate with portal calls
4. Update `src/pages/Settings.tsx` -- wire plan selection to `create-checkout`, wire cancel/manage to `customer-portal`, show real renewal date
5. Update `src/components/app/BuyCreditsModal.tsx` -- wire credit pack purchase to `create-checkout`, wire plan upgrades similarly
6. Update `src/components/app/NoCreditsModal.tsx` -- wire credit pack purchase to `create-checkout`
7. Handle `?payment=success` and `?payment=cancelled` query params on Settings page with toast + balance refresh

### Technical Details

- Edge functions use `verify_jwt = false` with manual auth token validation
- `check-subscription` is called on login, page load, and after checkout return to sync Stripe state to the database
- Plan changes via checkout redirect users to Stripe-hosted pages; no inline card forms needed
- Credit pack purchases use `mode: 'payment'`; subscriptions use `mode: 'subscription'`
- `customer-portal` enables cancel, reactivate, and payment method management via Stripe's hosted UI

