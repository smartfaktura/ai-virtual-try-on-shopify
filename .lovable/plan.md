

## Fix: Plan Cards Visual Hierarchy + Show Price in Current Plan

### Problem
1. The Growth card always shows "Most Popular" badge and a ring highlight (`ring-2 ring-primary`), which visually competes with the user's actual current plan (Pro). It looks like the user is on the wrong plan.
2. The "Current Plan" section in Settings doesn't show the monthly price, so the user can't quickly see what they're paying.

### Changes

#### `src/components/app/PlanCard.tsx`
- **Suppress highlight styling when another card is the current plan**: If `isCurrentPlan` is false but the card has `plan.highlighted`, still show the "Most Popular" text badge but remove the `ring-2 ring-primary` visual ring. Instead, apply the ring to the current plan's card.
- Simplest approach: override the ring logic — the card gets `ring-2 ring-primary` if `isCurrentPlan` is true, regardless of `plan.highlighted`. The "Most Popular" badge text can remain as a subtle label.

Concrete change on line 54:
```tsx
// Before
plan.highlighted ? 'ring-2 ring-primary rounded-2xl' : ''

// After  
isCurrentPlan ? 'ring-2 ring-primary rounded-2xl' : ''
```

This keeps the "Most Popular" text badge on Growth but removes the confusing ring, and adds the ring to the actual current plan instead.

#### `src/pages/Settings.tsx` (~line 218-220)
- Add the monthly price next to the credits info in the Current Plan section:
```tsx
<p className="text-sm text-muted-foreground">
  ${planConfig.name === 'Pro' ? '179' : ...}/mo • 4,500 credits/month
</p>
```
- To get the actual price, look up the current plan from `mainPlans` (already available) and show `plan.monthlyPrice` or the annual equivalent based on `billingInterval`.

Need to check how `mainPlans` and pricing data is structured:

#### Files changed
- **`src/components/app/PlanCard.tsx`** — line 54: ring goes to `isCurrentPlan` instead of `plan.highlighted`
- **`src/pages/Settings.tsx`** — lines 218-220: add price display from plan data next to credits

