

## Redesign: BuyCreditsModal Plans Tab for Paid Users

### Problem
For a paid user (e.g., Pro), the Plans tab shows all 4 plans with a monthly/annual toggle but gives no clear indication of their current billing cycle. When they click "Annual," there's no focused "switch to annual and save" flow — it just shows all plans at annual prices, which is confusing.

### Design

**For paid users on the Plans tab:**

1. **Add a billing status banner** at the top of the Plans tab, above the toggle:
   - "You're on **Pro** — billed monthly" (or "billed annually")
   - If monthly: include a subtle "Switch to annual & save 20%" call-to-action

2. **When user clicks "Annual" toggle (and they're currently monthly):**
   - Show a **focused upgrade card** for just their current plan, comparing monthly vs annual pricing:
     - "Your current: $179/mo billed monthly"  
     - "Switch to annual: $143/mo (save $432/year)"
     - Single prominent "Switch to Annual" CTA button
   - Below it, still show the full plan grid at annual prices (for users who want to upgrade tier + switch to annual)

3. **When user is already on annual billing:**
   - Default the toggle to "Annual" 
   - Show "You're on **Pro** — billed annually" banner
   - Hide the "switch to annual" nudge
   - Show all plans at annual prices normally

4. **For free users:** no change — show all plans as before with no banner

### Files Changed

**`src/components/app/BuyCreditsModal.tsx`**
- Derive `effectiveInterval = billingInterval || (plan !== 'free' ? 'monthly' : null)` 
- Add a billing status line above the billing toggle: "{Plan Name} · Billed monthly/annually"
- When `effectiveInterval === 'monthly'` and `billingPeriod === 'annual'`: render a focused "Switch to Annual" card for the current plan before the full grid, showing monthly→annual price comparison and a single CTA
- When `effectiveInterval === 'annual'`: hide the comparison card, just show plans at annual prices
- The focused card shows: current monthly price (crossed out), annual per-month price, total annual savings, and a "Switch to Annual Billing" button that calls `openCustomerPortal()` or `startCheckout()`

### No other files changed
All logic is contained within `BuyCreditsModal.tsx`. The `PlanChangeDialog`, `PlanCard`, and `Settings` page remain unchanged.

