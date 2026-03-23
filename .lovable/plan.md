

# Remove Loading Skeleton Flash on Returning User Dashboard

## Problem
MetricCards show skeleton loading states for ~1 second while queries resolve. For returning users this creates a jarring flash.

## Root Cause
The `loading` prop on MetricCards is set to `generatedLoading` / query loading states. On first mount these are `true` even though the queries already have `placeholderData` and default values (`0`).

## Solution

### `src/pages/Dashboard.tsx` (~lines 494-543)

Remove all `loading={...}` props from the 5 MetricCards in the returning user section. The queries already have default values (`generatedCount = 0`, `balance` from CreditContext), so cards will render immediately with `€0` / `0h` / etc. and update to real values seamlessly without a skeleton flash.

Cards affected:
1. Cost Saved — remove `loading={generatedLoading}`
2. Time Saved — remove `loading={generatedLoading}`  
3. Credits — remove `loading={creditsLoading}` (if present)
4. Continue Last — no loading prop (already fine)
5. Top Style — no loading prop (already fine)

### Files
- `src/pages/Dashboard.tsx` — remove `loading` props from MetricCards

