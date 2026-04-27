# GTM Funnel Events — V1 Implementation (Safety-Adjusted)

7 dataLayer events, fully deduplicated, privacy-safe, dev-only debug logging. Existing gtag.js (GA4 + Google Ads) and Meta Pixel are untouched. No `page_view` is pushed (GTM/GA4 already handles that). No new Google Ads conversion duplicates.

## 1. Fix GTM container ID (typo)
`index.html` lines 21 + 123: replace `GTM-P29VVFW3` → `GTM-P29VYFW3` in both the `<head>` script and the `<body>` `<noscript>` iframe.

## 2. New helper: `src/lib/gtm.ts`
- All public push functions accept only IDs, category strings, plan names, numeric values, currency codes, and `window.location.href`. **Never** emails, names, product titles, file names, prompts, or raw image URLs.
- Storage helpers wrap `localStorage` / `sessionStorage` access in `try/catch`. If storage is blocked (private mode, quota, SecurityError), fall back to two module-level `Set<string>` instances (`memDedupPersistent`, `memDedupSession`) so dedup still works in-memory and tracking never breaks the app.
- `import.meta.env.DEV` only: `console.debug('[GTM]', event, payload)` for verification in GTM Preview. Production builds emit nothing to the console.
- All currency values forced to `.toUpperCase()` before push.

Exports: `gtmSignUp`, `gtmProductUploaded`, `gtmFirstGenerationStarted`, `gtmFirstGenerationCompleted`, `gtmPricingPageView`, `gtmCheckoutStarted`, `gtmSubscriptionPurchase`.

## 3. Event wiring

| # | Event | Trigger location | Dedup key |
|---|---|---|---|
| 1 | `sign_up` | `src/contexts/AuthContext.tsx` line ~77, after existing `gtagSignUp('email')`. Fires only on a fresh successful signup, not on login or session refresh. | `gtm:signup:{user_id}` |
| 2 | `product_uploaded` | After successful insert in: `ManualProductTab.tsx` (single + batch), `StoreImportTab.tsx`, `CsvImportTab.tsx`, `ShopifyImportTab.tsx`, `MobileUploadTab.tsx`. Insert calls switched to `.select('id')` so we have a real `product_id`. Inside the success branch only — not on library load, not on import preview, not on failed insert. | `gtm:product:{product_id}` |
| 3 | `first_generation_started` | `src/hooks/useGenerationBatch.ts` line ~270, only after `enqueueWithRetry` returns success and `result.jobId` is set. `useGenerateVideo.ts` similarly for video flows. The shared dedup key ensures it fires once per user across image+video flows. | `gtm:firstgen-started:{user_id}` |
| 4 | `first_generation_completed` | `src/hooks/useGenerationBatch.ts` polling aggregator (~line 182), inside the live `if (allDone)` block, only when `aggregatedImages.length > 0` AND a job in this in-memory batch transitioned to completed. **Never** fired from history loaders (`useLibraryItems`, `useGenerationQueue` history reads). | `gtm:firstgen-completed:{user_id}` |
| 5 | `pricing_page_view` | `src/pages/Pricing.tsx` and `src/pages/AppPricing.tsx` `useEffect([])`. Per-path session dedup, 15-min TTL. Survives SPA route bounces, re-fires across browser sessions for proper attribution. | sessionStorage `gtm-session:pricing:{path}` |
| 6 | `checkout_started` | `src/contexts/CreditContext.tsx` `startCheckout`, fired only after `create-checkout` returns successfully with `data.sessionId` and `data.url` — never on click. Currency taken from Stripe response, uppercased. | `gtm:checkout:{sessionId}` |
| 7 | `subscription_purchase` | `src/contexts/CreditContext.tsx` `payment=success` URL handler, fires only when ALL of: `?payment=success` query param exists, `checkSubscription()` confirms `subscription_status === 'active'`, AND a valid transaction id exists AND has not been fired before. | `gtm:purchase:{transaction_id}` |

`transaction_id` resolution order: **`latest_invoice_id` → `latest_session_id` (matched against `?session_id=` from the success URL) → `stripe_subscription_id`**. The first non-empty wins.

## 4. Edge function changes

### `supabase/functions/create-checkout/index.ts`
- Update `success_url` to include the session id placeholder so the frontend can match the return to the actual checkout session:
  ```ts
  const defaultSuccessUrl = `${origin}/app/settings?payment=success&session_id={CHECKOUT_SESSION_ID}&amount=${priceAmount}`;
  ```
  (Stripe interpolates `{CHECKOUT_SESSION_ID}` server-side.)
- Extend response (additive, no breaking change):
  ```ts
  return new Response(JSON.stringify({
    url: session.url,
    sessionId: session.id,
    amount: priceObj.unit_amount ? priceObj.unit_amount / 100 : 0,
    currency: priceObj.currency, // Stripe lowercase, frontend uppercases
  }), ...);
  ```

### `supabase/functions/check-subscription/index.ts`
Extend response with extra fields the frontend needs to dedupe purchases:
```ts
{
  plan,
  subscription_status,
  credits_balance,
  current_period_end,
  billing_interval,
  // NEW:
  stripe_subscription_id: subscriptionId,
  latest_invoice_id: typeof activeSub?.latest_invoice === 'string'
    ? activeSub.latest_invoice
    : (activeSub?.latest_invoice as Stripe.Invoice | null)?.id ?? null,
  latest_session_id: latestSessionId, // most recent paid checkout session for this customer (already iterated)
  amount: planInfo?.price ?? null,    // optional, only if known from PRICE_TO_PLAN
  currency: planInfo?.currency ?? null,
}
```
Frontend reads these, picks the best `transaction_id` per the priority above.

## 5. Other edits
- `src/contexts/CreditContext.tsx`: `startCheckout(priceId, mode, planName?)` — optional planName so callers can label the event.
- `src/components/app/UpgradePlanModal.tsx` and `BuyCreditsModal.tsx`: pass `selectedPlan.name` to `startCheckout`.
- `src/contexts/AuthContext.tsx`: import `gtmSignUp`, call after `data.user` is populated.

## 6. What we explicitly do NOT change
- `src/lib/gtag.ts` and all gtag calls — left as-is.
- `src/lib/fbPixel.ts` and all Pixel calls — left as-is.
- No new Google Ads conversion event for purchase (existing `ads_conversion_PURCHASE_1` in `gtagPurchase` stays the only one).
- No `page_view` push to dataLayer (GTM Conversion Linker + GA4 already handle).

## 7. V2 follow-up (not in this PR)
Move `subscription_purchase` to a Stripe webhook → server-side GTM Measurement Protocol forward for reliable attribution. V1 frontend dedup by `transaction_id` is acceptable for launch.

---

## Test report (will be delivered after build, this is the template)

| # | Event | File:line | User action | Expected payload | Dedup key | Refresh / reopen test |
|---|---|---|---|---|---|---|
| 1 | `sign_up` | `AuthContext.tsx:~77` | Sign up new user via email | `{event:'sign_up',user_id,method:'email'}` | `gtm:signup:{user_id}` | Log out → log back in: NO re-fire |
| 2 | `product_uploaded` | `ManualProductTab.tsx:~540` + 4 import tabs | Successfully save a product | `{event,user_id,product_id,product_category?}` | `gtm:product:{product_id}` | Refresh `/app/products`: NO re-fire for same product |
| 3 | `first_generation_started` | `useGenerationBatch.ts:~270` | Submit first generation; backend returns `jobId` | `{event,user_id,product_id?,generation_id,visual_type,page_location}` | `gtm:firstgen-started:{user_id}` | Submit a 2nd generation: NO fire |
| 4 | `first_generation_completed` | `useGenerationBatch.ts:~183` | Wait for first generation to finish with images | `{event,user_id,product_id?,generation_id,visual_type,result_count}` | `gtm:firstgen-completed:{user_id}` | Reopen library / view past results: NO fire |
| 5 | `pricing_page_view` | `Pricing.tsx:32`, `AppPricing.tsx:~228` | Visit `/pricing` or `/app/pricing` | `{event,user_id?,page_location}` | sessionStorage `gtm-session:pricing:{path}`, 15 min TTL | SPA-nav away+back within 15 min: NO; new tab/session: YES |
| 6 | `checkout_started` | `CreditContext.tsx:~181` | Click upgrade → Stripe responds with `sessionId` | `{event,user_id,checkout_id,plan_name,value,currency:UPPERCASE}` | `gtm:checkout:{sessionId}` | Cancel and return: NO; new checkout = new sessionId = YES |
| 7 | `subscription_purchase` | `CreditContext.tsx:~228` | Complete Stripe payment, return to `?payment=success&session_id=…` | `{event,user_id,transaction_id,plan_name,value,currency:UPPERCASE}` | `gtm:purchase:{transaction_id}` | Refresh success URL or revisit later: NO; existing active sub triggers `payment=success`: NO (transaction_id unchanged) |

**GTM Preview verification:** open Tag Assistant connected to `GTM-P29VYFW3`, perform each row's user action, confirm the `dataLayer.push` appears in the Variables panel. Dev console mirrors as `[GTM] {event} {…}` for cross-checking. Production builds skip the console log.
