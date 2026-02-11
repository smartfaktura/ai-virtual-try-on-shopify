

## Improve "Not Enough Credits" UX

### Problems
1. "You have 2 — need 4" is cryptic and unclear
2. The amber button doesn't look clickable -- it reads like a warning label, not a call-to-action
3. No clear path forward for the user

### Design

Replace the current bottom bar with a cleaner, more actionable layout when credits are insufficient:

**New layout for the action bar:**
- A subtle inline banner spanning the full width of the action bar area
- Light amber/warm background with a clear message: **"You need 2 more credits to generate"**
- Two clear action buttons side by side:
  - **"Buy Credits"** -- primary amber button, opens the buy modal
  - **"Upgrade Plan"** -- secondary/outline button, also opens buy modal (which has the upgrade tab)
- Drop the raw "You have 2 — need 4" text entirely

### Technical Details

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

Replace the insufficient credits section (the current amber button + cryptic text) with:

```
When insufficientCredits && !isLoading:

<div className="flex items-center gap-3 w-full">
  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 flex-1">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span>You need <strong>{creditCost - (currentBalance ?? 0)} more credits</strong> to generate</span>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={onBuyCredits}>
      Upgrade Plan
    </Button>
    <Button size="sm" onClick={onBuyCredits} className="bg-amber-500 hover:bg-amber-600 text-white">
      Buy Credits
    </Button>
  </div>
</div>
```

This gives:
- A human-readable message ("You need 2 more credits to generate")
- Two clearly styled, obviously clickable buttons
- Clean layout that doesn't look like a broken/disabled state

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Replace the insufficient credits action bar with inline message + two action buttons |

