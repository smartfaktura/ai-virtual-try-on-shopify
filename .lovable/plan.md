

# Show "Buy Credits" button when balance is 0 in Freestyle

## Problem
When the user has 0 credits and no prompt entered, the Generate button is greyed out and disabled. There's no way to buy credits from this position — the "Buy Credits" variant only appears when a prompt is typed AND credits are insufficient.

## Fix

### `src/components/app/freestyle/FreestylePromptPanel.tsx` — Lines 437-482

Change the logic so that when `creditBalance === 0` (and credits aren't hidden), always show the "Buy Credits" button — even if `canGenerate` is false.

Current condition for showing "Buy Credits":
```
showInsufficientCredits = !hideCreditCost && canGenerate && !hasEnoughCredits
```

New condition:
```
const isZeroCredits = !hideCreditCost && creditBalance !== undefined && creditBalance <= 0;
const showInsufficientCredits = !hideCreditCost && canGenerate && !hasEnoughCredits;
const showBuyCredits = isZeroCredits || showInsufficientCredits;
```

Then use `showBuyCredits` instead of `showInsufficientCredits` for the button rendering branch. The "Buy Credits" button will be always active (not disabled), calling `onGenerate` which already opens the NoCreditsModal when balance is insufficient.

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Add `isZeroCredits` check, show Buy Credits button when balance is 0 regardless of prompt state |

