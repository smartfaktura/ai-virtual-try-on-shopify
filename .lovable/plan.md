## What's actually happening

The backend is fine. Edge logs confirm `create-checkout` returns a real `sessionId` (e.g. `cs_live_b1glOF...`), `amount: 79`, `currency`. So `begin_checkout` IS being pushed to `dataLayer`.

The reason it doesn't appear in your GTM Preview screenshot is the **redirect to Stripe**. The current code uses GTM's `eventCallback` as the redirect gate. When GTM has no tag listening for `begin_checkout`, the callback fires almost instantly → `window.location.href = stripe_url` runs → the page tears down before Tag Assistant can render the event in the timeline.

That is also why `pricing_modal_view` shows up: it doesn't redirect away.

## Fix (single small change)

Change the redirect gate in `src/contexts/CreditContext.tsx` so it does NOT use `eventCallback` as the green light. Instead:

1. Push `begin_checkout` to dataLayer (already correct).
2. Wait a fixed minimum hold of **1500ms**, regardless of GTM callbacks.
3. Then `window.location.href = data.url`.

This guarantees the event is sitting in `dataLayer` long enough for Tag Assistant Preview to render it, and for any future GTM tag/conversion to fire.

Also remove the `eventCallback`/`eventTimeout` plumbing from `gtmBeginCheckout` to keep the helper simple and prevent future regressions. The payload stays exactly the same:

```json
{
  "event": "begin_checkout",
  "user_id": "...",
  "checkout_id": "cs_live_...",
  "plan_name": "Growth",
  "value": 79,
  "currency": "EUR",
  "page_location": "..."
}
```

## Files touched

- `src/contexts/CreditContext.tsx`
  - Replace the `await new Promise(...)` block with: push event, then `await new Promise(r => setTimeout(r, 1500))`, then redirect.
  - Keep debug log for sessionUserId/sessionId/amount/currency under `vovv_gtm_debug === '1'`.
- `src/lib/gtm.ts`
  - Drop `eventCallback`/`eventTimeout` from `gtmBeginCheckout` signature. Keep dedup, payload, debug logs.

## Things explicitly NOT changed

- No reintroduction of the old premature `gtagBeginCheckout`.
- `pricing_modal_view` untouched.
- Purchase tracking untouched, no duplicates.
- Cancel checkout still produces no purchase event.

## Why this works in GTM Preview

GTM Preview shows events as they arrive in `dataLayer`. If the page is destroyed within ~50–200ms of the push (which is what `eventCallback` enables when no tag matches), Preview never gets a chance to render it. A deterministic 1500ms hold removes that race entirely.

## After implementation, expected flow

```text
Open modal           → pricing_modal_view appears in Preview
Select plan / pack   → create-checkout returns sessionId
                     → begin_checkout appears in Preview with checkout_id, plan_name, value, currency
                     → ~1.5s later, Stripe Checkout opens
Cancel checkout      → no purchase event
Payment success      → existing purchase tracking only
```

<lov-actions>
  <lov-open-history>View History</lov-open-history>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>