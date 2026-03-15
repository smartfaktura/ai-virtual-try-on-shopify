

## Improve BuyCreditsModal Header for Paid Subscribers

The modal header currently shows just the balance number and plan badge, but lacks key subscription info like renewal date and billing interval. For paid users, this is a missed opportunity to show plan context.

### Change: Enhanced header in `BuyCreditsModal.tsx`

Replace the current balance header (lines 116-138) with a richer version for paid users that shows:

1. **Balance + plan badge** (keep existing)
2. **Renewal info line** below the balance: "Renews [date] · [monthly/annual]" using `currentPeriodEnd` and `billingInterval` from `useCredits()`
3. **Canceling status**: If `subscriptionStatus === 'canceling'`, show "Cancels on [date]" in amber/warning color instead

For free users, keep the current simple header unchanged.

**Implementation detail:**

```tsx
{/* Below the balance row, inside the header div */}
{isPaidUser && currentPeriodEnd && (
  <p className="text-[11px] text-muted-foreground mt-1">
    {subscriptionStatus === 'canceling' 
      ? `Cancels ${currentPeriodEnd.toLocaleDateString(...)}`
      : `Renews ${currentPeriodEnd.toLocaleDateString(...)} · billed ${effectiveInterval || 'monthly'}`
    }
  </p>
)}
```

The `currentPeriodEnd` and `billingInterval` are already available from `useCredits()` and already destructured on line 16. No new data fetching needed.

### Files
- `src/components/app/BuyCreditsModal.tsx` — add renewal info to header

