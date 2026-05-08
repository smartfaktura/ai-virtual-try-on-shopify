## Problem

On the Product Images Review step (Step 4), when the user has insufficient credits, the only indication is red "Not enough" text in the sticky bar and a disabled Generate button. There is no clickable way to open the upgrade/buy-credits modal from the review screen itself.

## Solution

Add a **"Get credits"** call-to-action inside the **Credits summary card** on the review step when `!canAfford`. This keeps it near the cost context and independent of the sticky bar.

### Changes

**`src/components/app/product-images/ProductImagesStep4Review.tsx`**
- Import `useCredits` from `@/contexts/CreditContext`
- Inside the Credits card (`!canAfford` state), add a primary-styled button that calls `openBuyModal()`
- Mobile: full-width button below the balance row
- Desktop: same, keeping the card's existing padding and spacing

This is a minimal single-file change.
