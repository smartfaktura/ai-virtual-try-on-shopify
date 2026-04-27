I investigated the current implementation and found an important clue: the live app does create Stripe sessions correctly, and the live bundle does include the current `begin_checkout` dataLayer push. So this is probably not a backend/session/delay issue anymore.

The likely technical issue is the way the event is being pushed. Right now `begin_checkout` is a plain object push:

```ts
dataLayer.push({ event: 'begin_checkout', ...checkoutFields })
```

That is valid for GTM custom events, but GTM Preview/Tag Assistant often displays GA4/Google tag events more reliably when they are emitted through `gtag('event', 'begin_checkout', params)`. The old event appeared because it used `gtag`; after switching to plain object-only GTM push, it disappeared from the timeline even though the code path is present.

Plan:

1. Keep the corrected timing
   - Do not restore the old premature checkout event
   - Keep firing only after `create-checkout` returns `data.url` and `data.sessionId`
   - Keep using the Stripe session id for deduplication

2. Change `gtmBeginCheckout` to push through both compatible paths
   - First push a clean GTM object event with the required fields
   - Then also call `window.gtag('event', 'begin_checkout', params)` with the same required checkout fields
   - This makes the event visible to Google Tag Assistant / GA4-style preview while preserving GTM custom-event compatibility

3. Prevent stale dataLayer state from confusing GTM Preview
   - Before the `begin_checkout` event, clear modal-only fields from the current dataLayer state by pushing them as `undefined` / reset values
   - This avoids `modal_name`, `source`, and `current_plan` visually leaking from the previous `pricing_modal_view`

4. Add explicit debug verification
   - Log whether `window.dataLayer` exists
   - Log whether `window.gtag` exists
   - Log dataLayer length before/after push
   - Log the exact payload and dedup key when `vovv_gtm_debug` is enabled

5. Keep a deterministic redirect hold
   - Keep the 1500ms hold after a successful fire before redirecting to Stripe
   - The hold is no longer treated as the root fix, only as a safety buffer for Preview visibility

Expected result:

```text
Open modal -> pricing_modal_view appears
Click checkout -> create-checkout succeeds
Before Stripe redirect -> begin_checkout appears in GTM Preview with:
  checkout_id: cs_...
  plan_name: Starter/Growth/Pro or credit pack
  value: 39 / 79 / etc
  currency: EUR/USD
```

Technical files to update:

- `src/lib/gtm.ts`
- `src/contexts/CreditContext.tsx` only if needed for richer debug logs

No backend changes are needed because `create-checkout` is already returning `sessionId`, `amount`, and `currency` successfully.