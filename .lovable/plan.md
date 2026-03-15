

## Current Logic

The `LowCreditsBanner` shows based on percentage thresholds of `monthlyCredits`:

| Threshold | Formula | Free (20) | Starter (500) | Growth (1500) | Pro (4500) |
|-----------|---------|-----------|---------------|---------------|------------|
| `isLow` | 20% | < 4 | < 100 | < 300 | **< 900** |
| `isCritical` | 5% | < 1 | < 25 | < 75 | < 225 |
| `isEmpty` | = 0 | 0 | 0 | 0 | 0 |

**Your case**: Pro plan, 702 credits → `702 < 900` → banner shows "Running low on credits". That's arguably too aggressive for Pro — 702 credits is still 156+ standard freestyle generations.

## Proposed Fix

Use **fixed thresholds** that scale more sensibly, in `CreditContext.tsx` (lines ~213-216):

```typescript
// OLD: percentage-based
const lowThreshold = Math.round(planConfig.monthlyCredits * 0.2);
const criticalThreshold = Math.round(planConfig.monthlyCredits * 0.05);

// NEW: capped thresholds
const lowThreshold = planConfig.monthlyCredits === Infinity
  ? 0
  : Math.min(Math.round(planConfig.monthlyCredits * 0.2), 200);
const criticalThreshold = planConfig.monthlyCredits === Infinity
  ? 0
  : Math.min(Math.round(planConfig.monthlyCredits * 0.05), 50);
```

**Result with caps:**

| Plan | Low threshold | Critical threshold |
|------|--------------|-------------------|
| Free (20) | 4 | 1 |
| Starter (500) | 100 | 25 |
| Growth (1500) | 200 (capped) | 50 (capped) |
| Pro (4500) | 200 (capped) | 50 (capped) |

With 702 credits on Pro, `702 > 200` → banner hidden. It would only appear below 200 credits (~50 standard generations), which feels appropriate.

Single line change in `src/contexts/CreditContext.tsx`.

