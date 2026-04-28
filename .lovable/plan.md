## What's actually happening

Your Starter subscription IS active in Stripe (`sub_1TR9L8…`, $39/mo) and your account shows it correctly. Two real problems:

1. **No personalized post-payment experience** — Stripe just dumps you back on `/app/settings`, with only a small toast. There's no "Welcome to Starter — here's what to do next" screen.
2. **`purchase` event isn't reliably reaching Meta / Google Ads** — Meta Test Events shows `Initiate checkout` but never `Purchase`. Two root causes in the current code:
   - **Dedup blocks retries**: `gtmPurchase` persistently dedupes on `transaction_id` in `localStorage`. After your first test, every subsequent test on the same subscription/invoice is silently skipped — so you'll never see `Purchase` in Test Events even though everything else is wired correctly.
   - **Webhook race with no retry**: `CreditContext` waits 2s, calls `check-subscription` once, and if `subscription_status !== 'active'` (Stripe webhook hasn't propagated yet) it silently `return`s. There's no polling. No purchase event is ever fired for that visit.

## What we'll build

### 1. Dedicated `/app/payment-success` page (new route)

Stripe `success_url` will redirect here instead of `/app/settings?payment=success`. The page provides:

- Plan-aware celebration header: "You're now on **Starter**" / "Welcome to **Growth**" / "Your **500 credits** are ready"
- Subscription summary card: plan name, billing interval, monthly credits, next renewal date
- Three "what to do next" CTAs tailored to the plan:
  - Create your first visual → `/app/workflows`
  - Upload a product → `/app/products`
  - Explore presets → `/app/explore`
- Manage Billing button (links to Stripe Customer Portal)
- "Receipt sent to candlerashop@gmail.com" confirmation line
- For credit-pack purchases: "+500 credits added — new balance: 1,000"

Same minimalist VOVV.AI aesthetic (Inter, no terminal periods in headings, fade-in).

### 2. Reliable verification with polling (fixes Meta/Google not firing)

On mount, the success page polls `check-subscription` up to ~12 times over ~24s with backoff, until either:
- (subscription) `subscription_status === 'active'` AND we have `latest_invoice_id` / `stripe_subscription_id`, OR
- (credit pack) `last_credit_pack_purchase` is returned

Only then does it push the canonical `purchase` event to dataLayer (Meta Purchase + Google Ads conversion fire from GTM as already configured).

While polling: shows a "Confirming your payment…" spinner. If it eventually times out, shows "Your payment is processing — you'll get an email confirmation shortly" and still loads the celebration UI based on Stripe customer state.

### 3. Fix dedup so retesting works (and production stays safe)

In `src/lib/gtm.ts`, change `gtmPurchase` dedup from **persistent localStorage** to **sessionStorage with a 24h TTL**. Real users complete a purchase once per session — sessionStorage still prevents accidental double-fires from refreshes, but a fresh test in a new tab/incognito will fire cleanly. Same dedup key (`purchase:<transactionId>`).

Also add a debug bypass: when `localStorage.vovv_gtm_debug === '1'`, dedup is skipped and a `[GTM DEBUG purchase] FIRED` console line is logged with the full payload.

### 4. Edge function update

`create-checkout/index.ts`: change `success_url` from
`${origin}/app/settings?payment=success&session_id={CHECKOUT_SESSION_ID}&amount=…`
to
`${origin}/app/payment-success?session_id={CHECKOUT_SESSION_ID}`.

`cancel_url` stays on `/app/settings?payment=cancelled` (or move to `/app/pricing?payment=cancelled` — your call).

`check-subscription/index.ts`: no schema change needed. It already returns everything we need (`subscription_status`, `stripe_subscription_id`, `latest_invoice_id`, `latest_session_id`, `amount`, `currency`, `last_credit_pack_purchase`).

### 5. Clean up `CreditContext`

Remove the `?payment=success` URL handler entirely from `CreditContext.tsx` — purchase verification + GTM firing now live on the dedicated page. Keeps the `?payment=cancelled` toast.

## Files touched

- **NEW**: `src/pages/PaymentSuccess.tsx` — the celebration page with polling + GTM purchase fire
- **EDITED**: `src/App.tsx` (or wherever app routes live) — add `/app/payment-success` route
- **EDITED**: `supabase/functions/create-checkout/index.ts` — new `success_url`
- **EDITED**: `src/lib/gtm.ts` — `gtmPurchase` dedup → sessionStorage + 24h TTL + debug bypass
- **EDITED**: `src/contexts/CreditContext.tsx` — remove `payment=success` handler block (lines ~314-408 of useEffect)

## How you'll test it after the change

1. Open the site with `localStorage.setItem('vovv_gtm_debug','1')` → dedup off
2. Open Meta Events Manager → Test events tab + GTM Tag Assistant
3. Click any plan → complete a real Stripe payment with candlerashop@gmail.com
4. You'll be redirected to `/app/payment-success` (not Settings)
5. Page shows "Confirming your payment…" briefly, then the celebration screen
6. Within ~5s you should see in **Meta Test Events**: `Purchase` (eventID = `cs_…` or `in_…`), and in **Tag Assistant**: `purchase` event with full ecommerce payload
7. Console will show `[GTM DEBUG purchase] FIRED` with payload

## Notes / open questions

- The page handles both **subscriptions** and **credit-pack purchases** (different copy + CTA blocks).
- For free → paid plan upgrades, "Welcome to Starter". For paid → paid plan upgrades, "You've upgraded to Growth". Determined by comparing previous and new plan from check-subscription response.
- I am NOT adding Stripe webhooks — staying with the polling pattern you already have, just made reliable.
