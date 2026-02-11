

## Fix Credit Checks Across All Generation Flows

### Problem

Three issues found:

1. **Video Generator** (`VideoGenerate.tsx`) has zero credit checking -- users can generate videos (30 credits each) with no balance validation at all
2. **Workflows / Try-On Generator** (`Generate.tsx`) checks credits on click but the Generate button stays enabled, letting users click and then see a popup -- bad UX. Also uses the old `NoCreditsModal` which only does local credit adds (not persisted to DB)
3. **NoCreditsModal** still calls the local-only `addCredits()` instead of the `add_purchased_credits` RPC

### Changes

#### 1. VideoGenerate.tsx -- Add full credit awareness

- Import `useCredits` context
- Calculate video cost: `count x 30 credits` (1 video per generation = 30 credits)
- Show credit cost and balance info near the generate button
- When insufficient credits: disable generate button, show the same amber warning pattern with "buy credits" link and "Upgrade Plan" button (matching Freestyle style)
- When sufficient: show cost badge on the generate button

#### 2. Generate.tsx -- Disable button when insufficient + use BuyCreditsModal

- Replace `NoCreditsModal` with `openBuyModal()` from CreditContext (uses the redesigned modal)
- Disable the Generate button when `balance < cost` instead of letting users click then showing a modal
- Add amber warning text next to disabled button showing shortfall and upgrade/buy links
- Apply to all three generate button locations: standard, workflow, and try-on settings steps

#### 3. NoCreditsModal.tsx -- Wire to RPC (or remove)

- Since Generate.tsx will now use `openBuyModal()` instead, the `NoCreditsModal` component may no longer be needed
- If still referenced elsewhere, update it to call `add_purchased_credits` RPC instead of local `addCredits`

### Technical Details

| File | Change |
|------|--------|
| `src/pages/VideoGenerate.tsx` | Import `useCredits`, add credit cost display, disable generate button when insufficient, show upgrade/buy CTA |
| `src/pages/Generate.tsx` | Remove `NoCreditsModal`, use `openBuyModal()` from context, disable generate buttons when `balance < cost`, add inline insufficient credits warning near each generate button |
| `src/components/app/NoCreditsModal.tsx` | Remove or update to use RPC -- likely remove since both consumers will now use `BuyCreditsModal` |

### UX Result

Across all generation surfaces (Freestyle, Workflows, Try-On, Video), users will see:
- Credit cost clearly displayed before generating
- Generate button disabled when insufficient credits
- Inline amber warning with shortfall amount
- "buy credits" text link (opens Top Up tab) and "Upgrade Plan" button (opens Upgrade tab)
- Consistent experience everywhere

