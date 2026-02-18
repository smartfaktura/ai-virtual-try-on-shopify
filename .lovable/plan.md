

## Stripe Integration Plan for VOVV.AI

### Overview

This plan connects real Stripe payments to your existing plan/credit UI. After implementation, users will be able to subscribe to paid plans (Starter/Growth/Pro), purchase one-time credit packs, and manage their subscription (cancel/reactivate) -- all with real money flowing through Stripe.

---

### Phase 1: Enable Stripe and Prepare Database

**1a. Enable the Stripe connector**
- Use the Lovable Stripe integration tool to connect your Stripe account
- This will securely store your Stripe Secret Key and unlock Stripe-specific tools for creating products/prices

**1b. Create Stripe Products and Prices**
- Use Stripe tools to create 3 subscription products matching your existing plan data:

| Plan | Monthly Price | Annual Price |
|------|-------------|-------------|
| Starter | $39/mo | $31/mo billed yearly ($372) |
| Growth | $79/mo | $63/mo billed yearly ($756) |
| Pro | $179/mo | $143/mo billed yearly ($1,716) |

- Create 3 one-time products for credit packs:

| Pack | Price | Credits |
|------|-------|---------|
| 200 credits | $15 | 200 |
| 500 credits | $29 | 500 |
| 1,500 credits | $69 | 1,500 |

**1c. Add Stripe columns to `profiles` table**

New columns via database migration:

| Column | Type | Default |
|--------|------|---------|
| `stripe_customer_id` | text | null |
| `subscription_status` | text | 'none' |
| `stripe_subscription_id` | text | null |
| `current_period_end` | timestamptz | null |

---

### Phase 2: Backend Edge Functions

**2a. `create-checkout` edge function (NEW)**
- Accepts: `{ type: 'subscription' | 'credits', priceId, userId }`
- Looks up or creates a Stripe Customer for the user (stores `stripe_customer_id` in profiles)
- Creates a Stripe Checkout Session:
  - Subscriptions: `mode: 'subscription'` with the plan's Stripe Price ID
  - Credit packs: `mode: 'payment'` with the pack's Stripe Price ID
- Passes `userId` and `type` in `metadata` for webhook processing
- Returns the checkout URL to the frontend

**2b. `customer-portal` edge function (NEW)**
- Creates a Stripe Billing Portal session for the authenticated user
- Allows users to manage payment methods, view invoices, and cancel from Stripe's hosted UI
- Returns the portal URL

**2c. `stripe-webhook` edge function (NEW)**
- Verifies Stripe webhook signature
- Handles these events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` (subscription) | Call `change_user_plan()` to set plan + credits, update `subscription_status = 'active'`, store `stripe_subscription_id` |
| `checkout.session.completed` (credits) | Call `add_purchased_credits()` to add credits |
| `invoice.paid` | Refresh credits for the new billing period |
| `customer.subscription.updated` | Sync `subscription_status` and `current_period_end` |
| `customer.subscription.deleted` | Set plan back to 'free', set `subscription_status = 'none'` |

---

### Phase 3: Frontend Wiring

**3a. Update `CreditContext.tsx`**
- Fetch `subscription_status` and `current_period_end` from the `profiles` table (currently hardcoded as `'none'` and `null`)
- Remove placeholder `cancelSubscription` / `reactivateSubscription` -- replace with real edge function calls

**3b. Update `Settings.tsx` -- Plans tab**
- `handleDialogConfirm` for upgrades/plan changes: call `create-checkout` edge function, then redirect to Stripe Checkout URL
- `handleDialogConfirm` for cancel: call `customer-portal` edge function, redirect to Stripe portal
- `handleDialogConfirm` for reactivate: call `customer-portal` edge function
- Show real `current_period_end` date instead of hardcoded "Feb 15, 2026"

**3c. Update `BuyCreditsModal.tsx`**
- `handlePurchase` for credit packs: call `create-checkout` with `type: 'credits'`, redirect to Stripe Checkout
- `handleDialogConfirm` for plan upgrades: same as Settings -- redirect to Checkout
- Remove the mock `addCredits()` call

**3d. Update `NoCreditsModal.tsx`**
- Same pattern: `handlePurchase` calls `create-checkout` for credit packs instead of mock `addCredits()`

**3e. Add success/cancel return pages**
- After Stripe Checkout, users return to `/app/settings?payment=success` or `?payment=cancelled`
- Show a toast on the Settings page based on the query param
- Refresh credit balance from the database on success

---

### Phase 4: Map Stripe Price IDs to Frontend

**Store Price IDs in `mockData.ts`**
- Add `stripePriceIdMonthly` and `stripePriceIdAnnual` fields to each plan in `pricingPlans`
- Add `stripePriceId` to each item in `creditPacks`
- Update the `PricingPlan` and `CreditPack` TypeScript types accordingly

---

### Summary of Files Changed

| File | Change |
|------|--------|
| `profiles` table | Add 4 new columns |
| `supabase/functions/create-checkout/index.ts` | NEW -- creates Stripe Checkout sessions |
| `supabase/functions/customer-portal/index.ts` | NEW -- creates Stripe portal sessions |
| `supabase/functions/stripe-webhook/index.ts` | NEW -- handles Stripe webhook events |
| `supabase/config.toml` | Add 3 new function entries |
| `src/contexts/CreditContext.tsx` | Fetch real subscription data, remove placeholders |
| `src/pages/Settings.tsx` | Wire confirm handlers to Stripe checkout |
| `src/components/app/BuyCreditsModal.tsx` | Wire purchase to Stripe checkout |
| `src/components/app/NoCreditsModal.tsx` | Wire purchase to Stripe checkout |
| `src/data/mockData.ts` | Add Stripe Price IDs to plans/packs |
| `src/types/index.ts` | Add `stripePriceId` fields to types |

### Execution Order

1. Enable Stripe connector (collects your secret key)
2. Create Stripe products/prices via Stripe tools
3. Run database migration (add columns)
4. Build 3 edge functions (checkout, portal, webhook)
5. Wire frontend components to call edge functions
6. Test end-to-end: subscribe, buy credits, cancel, reactivate

