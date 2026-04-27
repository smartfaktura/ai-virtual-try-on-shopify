The current code is very close, but the failure mode is now clearer: `pricing_modal_view` proves `window.dataLayer.push(...)` works. The missing `begin_checkout` is most likely happening because checkout redirects to Stripe before Tag Assistant/GTM has time to receive and display the custom dataLayer event, or because the frontend is using `user?.id` from React context instead of the confirmed auth session user when deciding whether to fire.

I will implement a more deterministic checkout tracking flow instead of relying on the current 300ms delay.

## Plan

1. Update `gtmBeginCheckout` in `src/lib/gtm.ts`
   - Make it return `true` when the event is actually pushed and `false` when blocked/deduped
   - Keep the existing dedup key: `checkout:{sessionId}`
   - Add optional GTM callback support:
     - `eventCallback`
     - `eventTimeout`
   - Keep the payload clean: no `modal_name`, no `current_plan`

2. Update `startCheckout` in `src/contexts/CreditContext.tsx`
   - Keep `begin_checkout` firing only after `create-checkout` succeeds with `data.url + data.sessionId`
   - Use the confirmed session user id from `supabase.auth.getSession()` as the primary `user_id`, with React context user as fallback
   - Push `begin_checkout` with a GTM `eventCallback`
   - Redirect to Stripe only after either:
     - GTM calls `eventCallback`, or
     - a safe timeout expires
   - Keep a fallback redirect so checkout never gets stuck if GTM is blocked

3. Keep `pricing_modal_view` unchanged
   - It will continue firing on modal open only
   - No modal fields will be added to `begin_checkout`

4. Keep purchase tracking unchanged
   - No new purchase event
   - Existing payment-success purchase flow remains separate

5. Keep/debug improve current diagnostics
   - Preserve `vovv_gtm_debug=1` logging
   - Log whether `begin_checkout` was pushed, deduped, blocked, callback-fired, or timeout-redirected

## Expected result

Flow after the fix:

```text
Open modal
  -> pricing_modal_view appears in GTM Preview

Click plan / credit pack
  -> create-checkout returns url + sessionId
  -> begin_checkout is pushed with checkout_id, plan_name, value, currency
  -> GTM acknowledges the event or timeout fallback runs
  -> Stripe Checkout opens

Cancel Stripe
  -> no purchase event

Complete payment
  -> existing purchase tracking only
```

## Expected sample payloads

`pricing_modal_view` stays separate:

```json
{
  "event": "pricing_modal_view",
  "user_id": "user_...",
  "modal_name": "upgrade_plan",
  "source": "...",
  "current_plan": "free",
  "page_location": "https://vovv.ai/app/..."
}
```

`begin_checkout` becomes:

```json
{
  "event": "begin_checkout",
  "user_id": "user_...",
  "checkout_id": "cs_...",
  "plan_name": "Growth",
  "value": 79,
  "currency": "EUR",
  "page_location": "https://vovv.ai/app/..."
}
```

Technical note: GTM may also receive internal callback fields on the raw dataLayer object, but the business payload remains the fields above.