

## Smart Downgrade Flow with Retention Offer

### Problem

Currently, `change_user_plan` overwrites `credits_balance` with the new plan's quota. If a user on Pro (6,000 credits) with 4,500 remaining downgrades to Starter (1,000), they lose 3,500 credits. Also, there's no confirmation step -- downgrades happen instantly with a single click.

### Solution: 3 Changes

#### 1. Database: Preserve credits on downgrade

Update the `change_user_plan` SQL function so that on downgrade (when `p_new_credits < current balance`), it keeps the existing balance instead of overwriting it. On upgrade, it still sets credits to the new plan's quota (as before).

```
-- Logic:
-- If new plan credits >= current balance -> set to new plan credits (upgrade)
-- If new plan credits < current balance -> keep current balance (downgrade)
credits_balance = GREATEST(credits_balance, p_new_credits)
```

#### 2. Frontend: Two-step downgrade confirmation

Add a state machine in `BuyCreditsModal.tsx` for downgrade flow:

- **Step 1 -- "Are you sure?"**: An AlertDialog appears when clicking a lower-tier plan. Shows what they'll lose feature-wise (e.g., "You'll lose Video generation, Virtual Try-On"). Reassures them their credits are safe: "Your remaining X credits will stay in your account." Buttons: "Keep Current Plan" (dismiss) / "Yes, Downgrade" (proceed to step 2).

- **Step 2 -- Retention offer (10% off)**: A second dialog appears: "Before you go -- how about 10% off your current plan?" Shows the discounted price (e.g., "$161.10/mo instead of $179/mo for Pro"). Buttons: "Claim 10% Off" (closes dialog, shows success toast -- dummy, no actual billing change) / "No thanks, downgrade" (executes the downgrade).

#### 3. Determine upgrade vs. downgrade

Use the plan tier order (free < starter < growth < pro < enterprise) to determine direction. Compare the target plan's position against the current plan's position in a simple ordered array.

### Technical Details

| File | Change |
|------|--------|
| `supabase/migrations/` (new) | Update `change_user_plan` to use `GREATEST(credits_balance, p_new_credits)` so downgrades preserve credits |
| `src/components/app/BuyCreditsModal.tsx` | Add downgrade detection, two-step AlertDialog flow (confirmation then retention offer), keep existing upgrade flow unchanged |

### Downgrade Flow Diagram

User clicks lower plan -> Is it a downgrade?
- No -> Upgrade immediately (existing flow)
- Yes -> Step 1: "Are you sure?" dialog
  - "Keep Current Plan" -> Close
  - "Yes, Downgrade" -> Step 2: "10% off current plan" offer
    - "Claim 10% Off" -> Toast success, close (dummy)
    - "No thanks, downgrade" -> Execute `change_user_plan` RPC, refresh, close

### What stays the same
- Upgrade flow (clicking a higher plan) works exactly as before -- instant upgrade with new credits
- Top Up tab unchanged
- All other credit logic unchanged

