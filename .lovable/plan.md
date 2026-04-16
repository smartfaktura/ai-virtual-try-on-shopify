

# Hide "Current Plan" Card for Free Users Who Never Subscribed

## Rationale
A brand-new free user already sees their plan info in the sidebar credit indicator and in the "Choose Your Plan" section below. The "Current Plan" card showing "$0, 20 credits, 0/20, View past invoices" adds no value and clutters the page.

## Logic
Hide the entire `<Card>` block (lines 353-417) when the user is on the free plan **and** has never had a subscription. The condition: `plan === 'free' && subscriptionStatus === 'none'`.

This means:
- **New free users** → card hidden
- **Users who cancelled a paid plan** (status = `canceling` or `past_due`) → card still shown so they can see renewal/access dates and manage billing
- **Active paid users** → card shown as normal

## Change

### `src/pages/Settings.tsx` — Lines 352-417

Wrap the `<Card>` in a conditional:

```tsx
{/* ─── Current Plan ─── */}
{!(plan === 'free' && subscriptionStatus === 'none') && (
  <Card>
    ...existing card content unchanged...
  </Card>
)}
```

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Conditionally hide Current Plan card for never-subscribed free users |

