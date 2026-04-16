

# Show Feedback Form After Every Product Images Generation

## Problem
The `ContextualFeedbackCard` uses `sessionStorage` with a fixed key (`vovv_fb_dismiss_product-visuals`) to suppress re-display after dismissal or submission. Once a user interacts with it once, it never appears again for the entire browser session. Since every generation produces different results, the feedback form should appear fresh each time.

## Solution
Make the dismiss key unique per generation batch by appending the `resultId` (first product key from results). This way each new generation gets its own dismiss state and the card always appears.

## Changes

### `src/components/app/product-images/ProductImagesStep6Results.tsx`
- Pass a unique `resultId` that changes per generation — already using `Array.from(results.keys())[0]`, which should differ per batch. No change needed here if that value changes per generation.

### `src/components/app/ContextualFeedbackCard.tsx`
- Change the dismiss key from `vovv_fb_dismiss_{workflow}` to `vovv_fb_dismiss_{workflow}_{resultId}` so each generation gets a fresh card
- If `resultId` is provided, include it in the key; otherwise fall back to workflow-only key for other usages

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Line 46: Include `resultId` in dismiss key |

