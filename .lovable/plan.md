

## Redesign Credits Modal: Horizontal Plans, Working Upgrade, Tab-Aware Opening

### Changes

#### 1. CreditContext -- Add tab-aware modal opening

Currently `openBuyModal()` always opens the modal with no way to specify which tab to show. We need to support opening to a specific tab:

- Add `openBuyModal(tab?: 'upgrade' | 'topup')` parameter
- Store the requested tab in state so the modal opens to the correct tab
- "Buy credits" link opens to `topup` tab, "Upgrade Plan" button opens to `upgrade` tab

**File**: `src/contexts/CreditContext.tsx`

#### 2. BuyCreditsModal -- Horizontal plan columns + working upgrade

**Upgrade Tab redesign**:
- Switch from vertical stacked cards to a **horizontal grid** (`grid-cols-4`) so all standard plans appear side by side for easy comparison
- Each column shows: plan name, price prominently, monthly credits, feature list vertically, and action button at bottom
- Current plan dimmed, recommended plan highlighted with badge
- Enterprise stays as a slim banner below the grid
- Wider modal: `max-w-4xl` to fit 4 columns

**Working upgrade function**:
- Replace `handleUpgrade` (which just navigates to settings) with actual RPC call to `change_user_plan`
- After successful plan change, call `refreshBalance()` to update the context
- Show success toast with new plan name and credits
- Close modal after successful upgrade
- Credits from the new plan quota are set via the RPC (it sets `credits_balance` to `p_new_credits`)

**File**: `src/components/app/BuyCreditsModal.tsx`

#### 3. FreestylePromptPanel -- Different actions for each button

- "buy credits" text link: calls `openBuyModal('topup')`
- "Upgrade Plan" button: calls `openBuyModal('upgrade')`

Currently both call the same `onBuyCredits` prop. We need two separate callbacks or pass the tab preference through.

**File**: `src/components/app/freestyle/FreestylePromptPanel.tsx`

#### 4. Freestyle.tsx -- Pass tab-aware callbacks

Wire up the two different modal open calls from the prompt panel.

**File**: `src/pages/Freestyle.tsx`

### Technical Details

| File | Change |
|------|--------|
| `src/contexts/CreditContext.tsx` | `openBuyModal` accepts optional `tab` param, stores `defaultTab` in state |
| `src/components/app/BuyCreditsModal.tsx` | Horizontal 4-column plan grid, working `change_user_plan` RPC call with credit allocation, uses `defaultTab` from context |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Add `onUpgradePlan` prop separate from `onBuyCredits`, wire to respective buttons |
| `src/pages/Freestyle.tsx` | Pass `openBuyModal('topup')` and `openBuyModal('upgrade')` as separate callbacks |

### Plan Upgrade Flow

1. User clicks "Upgrade" on a plan card
2. Frontend calls `change_user_plan(user_id, 'growth', 2500)` RPC
3. DB atomically sets `plan = 'growth'` and `credits_balance = 2500`
4. Frontend calls `refreshBalance()` to fetch updated values
5. Toast: "Upgraded to Growth! 2,500 credits added."
6. Modal closes
7. Sidebar credit indicator updates automatically

No payment gateway involved yet -- this is a dummy flow that directly activates the plan. When Stripe is added later, the webhook will call the same RPC.
