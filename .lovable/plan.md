

## Fix Credit Indicator + Add Separate Video Credits

### Current Issue
The credit indicator shows a single balance (1446 / 1,500) but doesn't distinguish between image and video credits. The progress bar also looks off visually.

### Solution
Add a separate video credits quota per plan, stored in the database alongside image credits. The CreditIndicator will show two compact rows: one for Image credits and one for Video credits, each with their own progress bar.

### Video Credit Quotas per Plan

| Plan | Image Credits | Video Credits |
|------|--------------|---------------|
| Free | 20 | 0 |
| Starter | 500 | 2 |
| Growth | 1,500 | 5 |
| Pro | 4,500 | 15 |
| Enterprise | Unlimited | Unlimited |

### Changes

**1. Database Migration**
- Add `video_credits_balance` column to `profiles` table (integer, default 0)
- Update `handle_new_user()` to set initial video credits to 0
- Add `deduct_video_credits` and `refund_video_credits` functions
- Set existing users' video credits based on their current plan

**2. `src/contexts/CreditContext.tsx`**
- Add `videoBalance` state
- Add `monthlyVideoCredits` to `PlanConfig`
- Update `PLAN_CONFIG` with video quotas
- Fetch `video_credits_balance` from profiles
- Add `deductVideoCredits`, `addVideoCredits` to context value
- Update `calculateCost` to flag video costs separately

**3. `src/components/app/CreditIndicator.tsx`**
- Show two sections: Image credits row + Video credits row
- Each row has its own icon (Sparkles for images, Film for video), balance, quota, and thin progress bar
- Video row only shows for plans with video credits > 0
- Clean, compact layout fitting the sidebar width

### Visual Design (CreditIndicator)

```text
+----------------------------------+
| GROWTH PLAN           Upgrade -> |
|                                  |
| [*] 1446 / 1,500         [+]    |
| ==============================-- | (image bar)
|                                  |
| [F] 5 / 5                       |
| ================================ | (video bar)
+----------------------------------+
```

### Files Modified
- Database migration (add video_credits_balance column + functions)
- `src/contexts/CreditContext.tsx` (add video balance tracking)
- `src/components/app/CreditIndicator.tsx` (dual credit display)
- `src/integrations/supabase/types.ts` (auto-updated)

