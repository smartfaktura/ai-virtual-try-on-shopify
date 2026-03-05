

## Analysis

There's an inconsistency in the billing toggle defaults across the app:

| Location | Default | File |
|---|---|---|
| Landing pricing section | **Monthly** | `LandingPricing.tsx` line 9 |
| Settings page | **Monthly** | `Settings.tsx` line 57 |
| Buy Credits modal | **Annual** | `BuyCreditsModal.tsx` line 20 |

The Buy Credits modal is the odd one out — it auto-selects annual, which can confuse users who expect to see the standard monthly price first.

## Plan

**File: `src/components/app/BuyCreditsModal.tsx`** (line 20)

Change the default billing period from `'annual'` to `'monthly'` so all three pricing views are consistent. Users can still toggle to annual and see the "Save 17%" badge, but they start with the transparent monthly price.

This is a one-line change: `useState<'monthly' | 'annual'>('annual')` → `useState<'monthly' | 'annual'>('monthly')`

