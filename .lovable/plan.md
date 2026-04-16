

# Fix "credits/bonus" Label on Settings Page

## Problem
On `/app/settings`, the Current Plan section shows "20 credits/bonus" for free users. The word "bonus" is confusing and unclear — it should simply say "credits" without the "/bonus" or "/month" suffix for free plans.

## Fix

### `src/pages/Settings.tsx` — Line 377

Change the label so free plan just shows "credits" without any suffix.

**Before:**
```tsx
{creditsTotal === Infinity ? 'Unlimited' : creditsTotal.toLocaleString()} credits/{plan === 'free' ? 'bonus' : 'month'}
```

**After:**
```tsx
{creditsTotal === Infinity ? 'Unlimited' : creditsTotal.toLocaleString()} credits{plan !== 'free' ? '/month' : ''}
```

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Remove "/bonus" suffix for free plan, show plain "credits" instead |

