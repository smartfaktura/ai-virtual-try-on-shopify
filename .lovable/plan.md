## Goal
Replace messy purchase tracking with one verified GTM event: `purchase`. Remove URL-only firing of `gtagPurchase` and Meta `trackPurchase`. Cover both subscriptions and credit packs. No Google Ads tag in code.

## Current state (from audit)
- `CreditContext` payment-success handler does:
  1. `trackPurchase(value, 'USD')` — Meta, URL-amount only, no dedup, no eventID
  2. `gtagPurchase(value, 'USD')` — fires `purchase` + `ads_conversion_PURCHASE_1`, no `transaction_id`
  3. `gtmSubscriptionPurchase(...)` after `checkSubscription` confirms `active` (verified, deduped, but only subs)
- Credit packs are fulfilled inside `check-subscription` (`add_purchased_credits`), but no purchase event is fired and no pack-level `transaction_id` / price are returned to the client.
- `subscription_purchase` is the only verified event today.

## Changes

### 1. Backend — `supabase/functions/check-subscription/index.ts`
Extend the response so the client can fire one verified `purchase` event for credit packs too.

When iterating `sessions.data` and detecting an unfulfilled paid `mode: 'payment'` session (existing loop), capture for the most recent one:
```text
last_credit_pack = {
  payment_intent_id (or session.id fallback),
  session_id,
  amount: session.amount_total / 100,
  currency: session.currency,
  credits: CREDIT_PACK_AMOUNTS[priceId],
  plan_name: `${credits} Credits`,
}
```
Return as new field `last_credit_pack_purchase` (null if none new in this call). Subscription fields stay as-is.

This means: a credit pack purchase is "verified" only on the same call where we transition the session to `fulfilled=true`, so refresh won't re-emit (Stripe metadata gate already exists).

### 2. `src/lib/gtm.ts`
Add new canonical helper:
```ts
gtmPurchase({
  userId, transactionId,
  purchaseType: 'subscription' | 'credits',
  planName, value, currency,
  pageLocation?
})
```
- Pushes:
  ```
  {
    event: 'purchase',
    user_id, transaction_id,
    purchase_type, plan_name,
    value, currency: UPPER,
    page_location
  }
  ```
- Persistent dedup key: `purchase:{transactionId}` (reuses existing `fireOncePersistent` so it shares the same dedup namespace as the old `subscription_purchase` — same `transaction_id` will not fire twice across event names).
- Debug logs gated by `vovv_gtm_debug`:
  - `[GTM DEBUG purchase verification]` with sessionId / paymentStatus / subscriptionStatus / txId / dedupKey / dedupExists / willFire
  - `[GTM DEBUG purchase payload]` with the final payload

Mark `gtmSubscriptionPurchase` as `@deprecated` and re-implement it internally as a thin wrapper around `gtmPurchase({ purchaseType: 'subscription' })` so any external caller keeps working but emits the new canonical event. Remove the call from `CreditContext` (replaced below).

### 3. `src/contexts/CreditContext.tsx` — payment=success handler
Rewrite the `?payment=success` branch:
- Read `session_id` from URL.
- **Remove**: `trackPurchase(value, 'USD')` and `gtagPurchase(value, 'USD')` calls. Drop the `gtagPurchase` and `trackPurchase` imports.
- Always show toast + clean URL.
- Wait briefly, then `await checkSubscription()` (server-side Stripe verification).
- After verification, read `latestSubscriptionMetaRef.current` extended with `lastCreditPackPurchase`.
- Decide event:
  - If `lastCreditPackPurchase` exists and `returnedSessionId === lastCreditPackPurchase.session_id` (or no constraint mismatch) → fire `gtmPurchase({ purchaseType: 'credits', transactionId: pack.payment_intent_id || pack.session_id, planName: pack.plan_name, value: pack.amount, currency: pack.currency })`.
  - Else if `meta.subscriptionStatus === 'active'` → resolve `transactionId = pickTransactionId({ invoiceId, sessionId: returnedSessionId || latestSessionId, subscriptionId })` → fire `gtmPurchase({ purchaseType: 'subscription', planName: meta.plan, value: meta.amount ?? 0, currency: meta.currency || 'USD' })`.
  - Else: do nothing (debug-log "willFire=false, reason=unverified").
- Dedup is enforced inside the helper via `purchase:{transaction_id}`.

### 4. Meta Pixel
Choose **Option A (preferred)**: do not fire Meta `Purchase` from app code anymore. The clean `purchase` dataLayer event is the source of truth; the user wires Meta Purchase as a tag in GTM (with `transaction_id` as eventID).

Keep `trackPurchase` in `src/lib/fbPixel.ts` exported (other callers may exist later) but no longer invoked from `CreditContext`.

### 5. Google Ads
No code changes. Leave `gtagPurchase` defined in `src/lib/gtag.ts` (no longer called anywhere) — could be removed in a follow-up. No `send_to` or `ads_conversion_PURCHASE_1` is added. User wires Google Ads Purchase tag in GTM bound to `purchase` event using `{{transaction_id}}`, `{{value}}`, `{{currency}}`.

## Files touched
- `supabase/functions/check-subscription/index.ts` — add `last_credit_pack_purchase` to response (capture during existing fulfillment loop).
- `src/lib/gtm.ts` — add `gtmPurchase`; wrap `gtmSubscriptionPurchase` to delegate; add debug logs.
- `src/contexts/CreditContext.tsx` — drop `trackPurchase` + `gtagPurchase` calls/imports; extend ref + dispatch to `gtmPurchase` for both flows.

## Final report items (delivered post-implementation)
1. Removed: `gtagPurchase(value, 'USD')` and `trackPurchase(value, 'USD')` from `CreditContext` payment-success handler.
2. Verifier: `supabase/functions/check-subscription` (Stripe `subscriptions.list` + `checkout.sessions.list` with `payment_status === 'paid'` + `metadata.fulfilled` gate).
3. Subscription `transaction_id` source: `latest_invoice_id` → `session_id` (URL or latest paid) → `stripe_subscription_id` (via `pickTransactionId`).
4. Credit pack `transaction_id` source: `payment_intent_id` → `session_id`.
5. Final event name: `purchase`.
6. Sample subscription payload, sample credit-pack payload, dedup confirmation, "no Google Ads tag in code", "Meta Purchase moved to GTM" — all confirmed in reply.

## Notes / non-goals
- `subscription_purchase` event will stop being emitted; if the user has GTM tags bound to it, they should be re-bound to `purchase` with a `purchase_type === 'subscription'` trigger condition. Worth flagging in the post-implementation message.
- `begin_checkout`, `pricing_*`, `sign_up`, `product_uploaded`, `first_generation_*`, Conversion Linker, GTM base install, Stripe checkout flow, Meta base PageView — untouched.