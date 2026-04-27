## Goal

Make `begin_checkout` and `purchase` dataLayer events carry stable Stripe IDs as **top-level fields** so GTM variables resolve cleanly (no more `undefined` for `checkout_id` / `transaction_id`), and put `purchase` into the same GA4 `ecommerce` shape that `begin_checkout` already uses.

Dedup, verification gating, and PII rules stay exactly as they are today.

---

## Current state (verified by reading the code)

- `begin_checkout` is pushed in **`src/lib/gtm.ts` → `gtmBeginCheckout`**, called from **`src/contexts/CreditContext.tsx` → `startCheckout`** *before* the `create-checkout` call. It already includes `ecommerce.value` / `ecommerce.currency`, but **no `checkout_id`** (Stripe session doesn't exist yet at that moment).
- `purchase` is pushed in **`src/lib/gtm.ts` → `gtmPurchase`**, called from **`CreditContext.tsx`** inside the `?payment=success` handler, **after** `check-subscription` returns and verifies the transaction. It already sets `transaction_id`, `value`, `currency` as top-level fields and dedupes on `gtm:purchase:{transaction_id}` in localStorage — but `value` / `currency` are **not** wrapped in `ecommerce`, so GTM "Ecommerce — value" variables read `undefined`.
- Transaction id is already chosen via `pickTransactionId` with the exact priority requested: `latest_invoice_id` (subs) → `payment_intent_id` (credit packs, via `lastCreditPackPurchase`) → `session_id` → `subscription_id`.
- Purchase is already gated on backend verification (`subscriptionStatus === 'active'` for subs, `lastCreditPackPurchase` only set on the call that flips Stripe `metadata.fulfilled` → `true` for credit packs). Refresh ⇒ `lastCreditPackPurchase` is `null` and the dedup key blocks re-fire. ✅

So the only real gaps are: **(a) attach `checkout_id` to `begin_checkout` once Stripe returns it, and (b) add the `ecommerce` block to `purchase`**.

---

## Changes

### 1. `src/lib/gtm.ts`

**`gtmBeginCheckout`**
- Add optional `checkoutId?: string | null` arg.
- When present, include `checkout_id: checkoutId` as a top-level field in the payload (alongside `plan_name`, `checkout_mode`, `page_location`, `ecommerce`).
- No change to the dedup key (still `planName + checkoutMode + path`, 10s TTL) — we don't want a second push just because the session id arrived later.

**`gtmPurchase`**
- Keep `transaction_id`, `purchase_type`, `plan_name`, `user_id`, `page_location` as top-level fields.
- Move `value` / `currency` into a GA4-shaped `ecommerce` block (mirrors `begin_checkout`):
  ```
  ecommerce: {
    transaction_id,
    currency: UPPER,
    value,
    items: [{ item_id: planName, item_name: planName, item_category: purchaseType, price: value, quantity: 1 }]
  }
  ```
- Push an `ecommerce: null` reset just before the event (same pattern `gtmBeginCheckout` uses) so GA4 ecommerce vars don't bleed across events.
- Keep persistent dedup on `gtm:purchase:{transaction_id}` exactly as today.
- No PII added. No email / product image / prompt fields.

**`gtmCheckoutSessionCreated`**
- Already carries `checkout_id`. Leave as the debug-only signal it is.

### 2. `src/contexts/CreditContext.tsx` → `startCheckout`

Today `gtmBeginCheckout` fires *before* `create-checkout` returns (intentional — survives the Stripe redirect). To get a real `checkout_id` on the event without firing twice:

- Keep the early `gtmBeginCheckout` call exactly where it is (pre-redirect safety), but **without** `checkoutId` (it doesn't exist yet).
- After `create-checkout` returns successfully with `data.sessionId`, call `gtmBeginCheckout` **again** with `checkoutId: data.sessionId`. The existing 10-second `(planName + checkoutMode + path)` session dedup in `gtmBeginCheckout` will drop this second call — so we need a small tweak:
  - When `checkoutId` is provided, *bypass* the time-based dedup but still dedup on the `checkoutId` itself (`begin-checkout-id:{checkoutId}` persistent key) so the same session id can never push twice across refreshes.
  - This guarantees: exactly one `begin_checkout` on intent (no `checkout_id`) **plus** at most one `begin_checkout` enrichment with the real `checkout_id` per Stripe session.
- Net result for GTM: at least one `begin_checkout` with `checkout_id` populated whenever `create-checkout` succeeds; if the user closes the tab before Stripe responds, the early one still fires (without `checkout_id`).

Alternative (simpler, recommended if the user is OK with it): **only push `begin_checkout` after `create-checkout` returns**, drop the pre-redirect push. That gives a single clean event with `checkout_id` always present, but loses the "fires even if Stripe is slow" safety net. I'll go with the dual-push approach above to preserve current behavior.

### 3. `src/contexts/CreditContext.tsx` → payment-success handler

No logic change. The payload going into `gtmPurchase` already has the right `transactionId` for both subs and credit packs. The `ecommerce` shape will start appearing automatically once `gtm.ts` is updated.

---

## What stays the same (safety guarantees)

- Purchase fires **only** after `check-subscription` verifies (`subscriptionStatus === 'active'` for subs, `lastCreditPackPurchase != null` for credit packs).
- Refresh on success page does **not** re-fire purchase: `lastCreditPackPurchase` is null on subsequent calls, and `gtm:purchase:{transaction_id}` blocks the sub path.
- Dedup keys: `gtm:purchase:{transaction_id}` (persistent), `gtm-session:begin-checkout:{plan}:{mode}:{path}` (10s), `gtm:begin-checkout-id:{sessionId}` (persistent, new).
- No PII added. Only IDs, plan name, value, currency, page_location.
- No Google Ads tag added in code — Google Ads / Meta tags continue to be wired in GTM bound to these custom events.

---

## QA checklist (after deploy, in GTM Preview with `localStorage.setItem('vovv_gtm_debug','1')`)

**`begin_checkout`**
- Fires on click; second push appears ~200–800 ms later with `checkout_id: cs_…` populated.
- `ecommerce.value` / `ecommerce.currency` correct.
- Double-clicking the buy button still fires only one `begin_checkout` (10s dedup).

**`purchase` — subscription**
- Fires once after Stripe redirect back, with `transaction_id` = invoice id (`in_…`) when available, falling back to session id (`cs_…`), then subscription id (`sub_…`).
- `ecommerce.value` = monthly price, `ecommerce.currency` = `USD`.
- Refreshing `?payment=success` page → no second push (dedup hit logged).

**`purchase` — credit pack**
- Fires once with `transaction_id` = payment intent id (`pi_…`), falling back to session id.
- `purchase_type: "credits"`, `plan_name: "{N} Credits"`.
- Refresh → no re-fire (server returns `lastCreditPackPurchase: null` after first verified call).

**Reporting after implementation**
- `begin_checkout` push site: `src/contexts/CreditContext.tsx` → `startCheckout` (helper: `src/lib/gtm.ts` → `gtmBeginCheckout`).
- `purchase` push site: `src/contexts/CreditContext.tsx` payment-success `useEffect` (helper: `src/lib/gtm.ts` → `gtmPurchase`).
- `transaction_id` source: `pickTransactionId({ invoiceId: latest_invoice_id, sessionId: returned_session_id || latest_session_id, subscriptionId: stripe_subscription_id })` for subs; `payment_intent_id || session_id` for credit packs.
- Both subscriptions and credit packs covered by the same canonical `purchase` event.