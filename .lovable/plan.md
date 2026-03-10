

## Analysis: Monthly vs Annual Billing Awareness

### Current Gaps

After examining the full flow, here's what's missing:

1. **Backend doesn't track billing interval**: The `check-subscription` edge function knows the price ID (which maps to monthly vs annual) but doesn't return this information to the frontend. It only returns `plan`, `subscription_status`, `credits_balance`, and `current_period_end`.

2. **No billing interval in CreditContext**: The global state has no concept of whether the user's subscription is monthly or annual.

3. **Current Plan card has no interval indicator**: The Settings page shows "credits/month" and renewal date, but never says "Billed monthly" or "Billed annually."

4. **Billing toggle doesn't reflect reality**: The monthly/annual toggle on Settings and BuyCreditsModal always defaults to "monthly" regardless of the user's actual billing interval. A monthly subscriber sees the same default as an annual subscriber.

5. **No "switch to annual" nudge**: A monthly subscriber has no clear path to switch to annual billing and save 20%. They'd have to guess to click "Manage Billing" and find it in the Stripe portal.

---

### Plan

#### 1. Return `billing_interval` from `check-subscription`
- Add a `PRICE_IS_ANNUAL` set or derive from the existing `PRICE_TO_PLAN` map to classify each price ID as monthly or annual
- Return `billing_interval: 'monthly' | 'annual' | null` in the response
- Sync it to the `profiles` table (add `billing_interval` text column via migration)

#### 2. Database migration
- Add `billing_interval` text column to `profiles` table, default `null`

#### 3. Update CreditContext
- Add `billingInterval: 'monthly' | 'annual' | null` to the context
- Read it from the profile fetch and from `check-subscription` response
- Expose it to consumers

#### 4. Update Settings — Current Plan card
- Show a badge or line: "Billed monthly" or "Billed annually" next to the plan name
- For monthly subscribers: add a small "Switch to annual & save 20%" link/button that opens the Stripe billing portal
- Default the billing period toggle to match the user's actual interval

#### 5. Update BuyCreditsModal
- Default the billing period toggle to match the user's actual interval (instead of always "monthly")
- For the current plan card, show the actual billing interval

#### 6. Update PlanCard (Settings page)
- When the card is the current plan, show "Billed monthly" or "Billed annually" subtitle under the price

---

### What stays the same
- All Stripe checkout/portal logic unchanged
- Plan selection, upgrade/downgrade flow unchanged  
- No visual redesign — just adding informational text and a smart default

