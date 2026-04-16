

## Goal

Match top-up UX to upgrade UX: user **selects** a credit pack (no instant Stripe redirect on click), then confirms via a single CTA at the bottom.

## Current behavior

In `UpgradePlanModal` topup variant: each credit-pack card has its own button that fires `startCheckout()` immediately on click. No selection state, no confirmation step. Risky (mis-clicks → Stripe redirect).

## Proposed behavior (mirrors upgrade flow)

1. Credit-pack cards become **selectable rows** (like upgrade plan cards).
2. Clicking a card sets `selectedPackId` — visual ring/border/check indicator.
3. Default preselected: the **"Best Value"** pack (currently middle one).
4. Single **"Continue to checkout"** primary button at bottom (same component used by upgrade variant).
5. Below CTA: existing `Cancel anytime · No commitment` + lock/redirect line stays.

## Changes to `UpgradePlanModal.tsx`

- Add `selectedPackId` state (initialized to `creditPacks.find(p => p.bestValue)?.id` or first pack as fallback).
- In topup variant card render:
  - Remove per-card button.
  - Wrap card in a clickable `<button>` / `<div onClick>` that sets `selectedPackId`.
  - Add selected state styling (matches upgrade card selected look: `ring-2 ring-primary border-primary` + check icon).
  - Keep "Best Value" badge.
- Reuse the existing bottom CTA: when topup variant, label = `Continue to checkout` (or `Get {N} credits` for clarity). On click → `startCheckout(selectedPack.stripePriceId, 'payment')`.
- Disable CTA if `!selectedPackId` (shouldn't happen due to default, but defensive).

## Visual parity check

- Upgrade variant: cards are selectable rows + bottom CTA → ✅
- Topup variant after change: cards are selectable rows + bottom CTA → ✅ (same pattern)

## Files touched

- `src/components/app/UpgradePlanModal.tsx` only.

## Out of scope

- No changes to `creditPacks` data, Stripe edge function, pricing, or any other modal.
- No changes to upgrade variant behavior.

## Expected result

Top-up modal feels identical to upgrade modal: tap pack → it highlights → tap "Continue to checkout" → Stripe. No more accidental redirects.

