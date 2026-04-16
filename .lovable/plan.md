

# Fix NoCreditsModal — Plan-Aware Content

## The Problem

Currently `NoCreditsModal` shows the same credit pack grid (200 / 500 / 1500 one-time packs) to all users. This is incorrect:

- **Free users** should see **subscription plans** (Starter / Growth / Pro) as their path to get credits — upgrading is the right action
- **Paid users** (Starter/Growth/Pro) should see **credit top-up packs** — they already have a plan and just need more credits for this billing cycle

## The Fix

**File**: `src/components/app/NoCreditsModal.tsx`

Read `plan` from `useCredits()`. Branch the modal content:

### When `plan === 'free'` (Free User)

Show subscription plans instead of credit packs:

```text
┌─────────────────────────────────────────────┐
│ Upgrade to Keep Creating                    │
│ Get monthly credits with a plan             │
│                                             │
│ ┌─────────┐ ┌───────────┐ ┌─────────┐      │
│ │ Starter │ │ Growth ★  │ │   Pro   │      │
│ │ $39/mo  │ │  $79/mo   │ │ $179/mo │      │
│ │ 500 cr  │ │ 1,500 cr  │ │ 4,500   │      │
│ │ 7.8¢/ea │ │  5.3¢/ea  │ │ 4.0¢/ea │      │
│ │ [Get]   │ │ [Get ★]   │ │ [Get]   │      │
│ └─────────┘ └───────────┘ └─────────┘      │
│                                             │
│ [Maybe Later]                               │
└─────────────────────────────────────────────┘
```

- Growth highlighted as recommended (best value)
- Show price-per-credit comparison
- CTA triggers `startCheckout(stripePriceIdMonthly, 'subscription')`
- No credit packs shown — free users should subscribe, not buy one-off packs

### When `plan !== 'free'` (Paid User)

Keep the current credit packs view (200 / 500 / 1500 top-up packs) — this is correct for paid users who just need more credits.

Additionally, show an upgrade nudge if they're on Starter or Growth:
- Starter user sees: "Upgrade to Growth for 3× more monthly credits"
- Growth user sees: "Upgrade to Pro for 3× more monthly credits"
- Pro user sees no upgrade nudge

### Changes

| File | Change |
|------|--------|
| `src/components/app/NoCreditsModal.tsx` | Read `plan` from `useCredits()`, conditionally render subscription plans (free) vs credit packs (paid), show next-plan upgrade nudge for Starter/Growth |
| `src/pages/AdminConversion.tsx` | Add plan toggle to Layer 3 preview so you can test both free and paid variants |

### Copy Adjustments

**Free user headline**: "Upgrade to Keep Creating" (not "Purchase credits")
**Free user subline**: "Get monthly credits and unlock premium features with a plan"
**Paid user headline**: Keep current category-aware headline
**Paid user subline**: "Top up credits to continue this session"

No other files need changes — the modal is self-contained.

