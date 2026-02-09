

## Fix Low Credits Banner Logic & Remove "10 images" Badge

### Issue 1: Low Credits Banner Showing Incorrectly

The banner uses a static threshold (`LOW_CREDIT_THRESHOLD = 200`) regardless of the user's plan. A Free plan user with 140 credits has **7x their monthly quota** but still sees the warning because 140 < 200.

**Fix in `src/contexts/CreditContext.tsx`**: Make thresholds relative to the plan's monthly credits instead of static values.

| Plan | Monthly Credits | Low Threshold (20%) | Critical Threshold (5%) |
|---|---|---|---|
| Free | 20 | 4 | 1 |
| Starter | 1,000 | 200 | 50 |
| Growth | 2,500 | 500 | 125 |
| Pro | 6,000 | 1,200 | 300 |
| Enterprise | Infinity | never | never |

Replace the static constants:
```
const LOW_CREDIT_THRESHOLD = 200;
const CRITICAL_THRESHOLD = 40;
```
With dynamic calculation based on the plan's monthly credits:
```
const lowThreshold = planConfig.monthlyCredits === Infinity
  ? 0
  : Math.round(planConfig.monthlyCredits * 0.2);
const criticalThreshold = planConfig.monthlyCredits === Infinity
  ? 0
  : Math.round(planConfig.monthlyCredits * 0.05);
```

### Issue 2: "10 images" Badge on Workflow Banner

The workflow info banner at the top of the Generate page shows `default_image_count` from the database (set to 10 for Virtual Try-On). This is confusing because the user controls how many images to generate -- it's not a fixed number.

**Fix in `src/pages/Generate.tsx` (line 605)**: Remove the `10 images` badge entirely from the workflow info banner, or replace it with a more useful label like just the workflow type.

### Files Changed
- `src/contexts/CreditContext.tsx` -- dynamic credit thresholds based on plan
- `src/pages/Generate.tsx` -- remove misleading "10 images" badge
