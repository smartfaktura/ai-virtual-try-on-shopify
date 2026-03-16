

## Fix: Remove blue border from Free plan card when it's the current plan

### Change

**`src/components/app/BuyCreditsModal.tsx`** line 327-328:

Currently, when `isCurrent` is true (including for the Free plan), it gets `border-2 border-primary ring-1 ring-primary/10`. 

Update the condition so that if the current plan is `free`, it gets a regular border instead of the highlighted primary border:

```typescript
isCurrent && p.planId !== 'free'
  ? 'border-2 border-primary ring-1 ring-primary/10 bg-card'
  : (p.highlighted && (plan === 'free' || targetIdx > currentIdx))
    ? 'border-2 border-primary/60 bg-card'
    : 'border border-border bg-card hover:shadow-sm'
```

This keeps the "Current" badge text but removes the visual emphasis border from Free since it's the default state and doesn't need highlighting.

