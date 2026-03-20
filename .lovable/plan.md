

# Improve: Show Credit Refund Info on Failed Workflow Activity Cards

## Problem
When a generation fails (rate limit, timeout, etc.), credits **are refunded** by the backend. But the activity card on the Workflows page only shows "1 image failed · Rate limit exceeded. Please wait and try again." — it never tells the user their credits were returned. This causes confusion ("will Retry charge me again?").

## Solution
Add a subtle refund note to the failed activity card so users know their credits are safe.

## Changes

### File: `src/components/app/WorkflowActivityCard.tsx`

In the failed card layout (line ~290-330), add a small reassurance line below the error message:

**Current:** `1 image failed · Rate limit exceeded. Please wait and try again.`

**After:** 
```
1 image failed · Rate limit exceeded. Please wait and try again.
Credits refunded automatically
```

The "Credits refunded automatically" text will be styled as a muted, smaller line (e.g., `text-xs text-muted-foreground`) so it's informative but not noisy. This applies to all failed states, since the backend always refunds on failure.

## Summary
- 1 file, ~3 lines added
- Users see "Credits refunded automatically" on every failed activity card
- No backend changes needed — refunds already happen

