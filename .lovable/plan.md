

## Add Working Credit Purchase and Plan Change Functions

### Current State

The database has `deduct_credits` and `refund_credits` SQL functions that work correctly for generation flows. However:

- **No `add_purchased_credits` function** -- There's no server-side function to atomically add credits after a purchase. The frontend `addCredits` only updates local React state.
- **No `change_user_plan` function** -- There's no server-side function to change a user's plan. The Settings page just shows a toast.
- When payment is eventually connected, there's no backend to call.

### Plan

#### 1. Create two new database functions

**`add_purchased_credits(p_user_id, p_amount)`**
- Atomically adds credits to the user's balance (same pattern as `refund_credits` but semantically separate for audit clarity)
- Returns the new balance
- SECURITY DEFINER so it can only be called via RPC

**`change_user_plan(p_user_id, p_new_plan, p_new_credits)`**
- Updates the user's `plan` column
- Sets `credits_balance` to the new plan's monthly allocation (or adds them, depending on business logic -- we'll set it to the new plan's quota for simplicity)
- Validates the plan is one of the allowed values
- Returns the updated row info

#### 2. Wire up frontend to call these RPCs

**Settings.tsx -- `handlePlanSelect`**
- Call `change_user_plan` RPC with the selected plan ID and its monthly credits
- Refresh the credit context after success
- Still show "coming soon" for now but the function will be ready

**Settings.tsx -- `handleCreditPurchase`**
- Call `add_purchased_credits` RPC with the pack's credit amount
- Refresh the credit context after success

**BuyCreditsModal.tsx -- `handlePurchase`**
- Same as above -- call `add_purchased_credits` RPC

**CreditContext.tsx**
- No changes needed; `refreshBalance` already re-fetches from DB

#### 3. Make it testable now (without payment)

Since there's no payment yet, we'll keep the toast saying "Payment integration coming soon" but the actual DB functions will exist and be tested. When Stripe is connected later, the webhook handler just needs to call these RPCs.

### Technical Details

| Component | Change |
|-----------|--------|
| **New migration** | Create `add_purchased_credits` and `change_user_plan` SQL functions |
| `src/pages/Settings.tsx` | Wire `handlePlanSelect` to call `change_user_plan` RPC, `handleCreditPurchase` to call `add_purchased_credits` RPC. For now, both still show "coming soon" toast but the functions are ready. |
| `src/components/app/BuyCreditsModal.tsx` | Wire `handlePurchase` to call `add_purchased_credits` RPC with "coming soon" toast |

**Note:** The actual purchase/plan-change calls will remain behind the "coming soon" toast until payment is connected. The DB functions will be created and deployable so Stripe webhooks can call them immediately when ready.

