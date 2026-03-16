

## Improve mobile "not enough credits" UX in Freestyle

### Problem
On mobile, when the user lacks credits, the text just says "Not enough credits" without showing the cost or the shortfall. The user has no idea how many credits are needed.

### Fix

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** — Lines 314-318

Replace the mobile-only vague text with a clear breakdown showing cost, balance, and shortfall on all screen sizes:

```tsx
) : showInsufficientCredits ? (
  <p className="text-xs text-muted-foreground mr-auto w-full sm:w-auto">
    <span className="hidden sm:inline">Need {creditCost - (creditBalance ?? 0)} more credits</span>
    <span className="sm:hidden">Need {creditCost - (creditBalance ?? 0)} more credits ({creditBalance ?? 0}/{creditCost})</span>
  </p>
```

This changes the mobile text from "Not enough credits" to something like "Need 6 more credits (2/8)" — showing the shortfall, current balance, and total cost in a compact format.

