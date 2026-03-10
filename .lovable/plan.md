

## Fix: Growth "Downgrade" Button Looks Like a Recommended Action

### Problem
The Growth card's CTA uses `variant="default"` (filled blue) because `plan.highlighted` is true (it's the "Most Popular" plan). But when the user is on Pro, that button says "Downgrade to Growth" — a filled blue downgrade button looks like a recommendation, which is misleading.

### Solution
Change the button variant logic: only use the `default` (filled) variant when the card is the current plan or when upgrading. Downgrades should always use `outline`.

**`src/components/app/PlanCard.tsx`** — line 116:
```tsx
// Before
variant={plan.highlighted ? 'default' : 'outline'}

// After — only highlight upgrades or the current plan's button
variant={isCurrentPlan ? 'default' : 'outline'}
```

This ensures:
- Current plan button → filled (but disabled, so it's muted anyway)
- Upgrade buttons → outline (neutral)
- Downgrade buttons → outline (neutral)
- No plan visually "recommends" downgrading

The "Most Popular" text badge on Growth still remains — only the button styling changes.

